import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/security';
import { getUserById, updateUser } from '@/lib/db/users';
import { supabaseAdmin } from '@/lib/supabase';
import type { BodyMeasurements, UserProfile } from '@/types';

const XAI_API_URL = 'https://api.x.ai/v1/images/generations';
const MEASUREMENT_KEYS = ['chest_cm', 'waist_cm', 'hips_cm', 'shoulders_cm', 'arm_cm', 'thigh_cm'];

function buildPrompt(user: UserProfile, measurements: BodyMeasurements | null): string {
  const parts: string[] = ['Full-body portrait of a'];

  // Gender
  if (user.gender === 'male') parts.push('male');
  else if (user.gender === 'female') parts.push('female');
  else parts.push('person');

  parts.push('fitness enthusiast');

  // Age range from DOB
  if (user.date_of_birth) {
    const age = Math.floor(
      (Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    if (age < 20) parts.push('in their late teens');
    else if (age < 30) parts.push('in their twenties');
    else if (age < 40) parts.push('in their thirties');
    else if (age < 50) parts.push('in their forties');
    else parts.push('middle-aged');
  }

  // Body type
  if (user.body_type === 'ectomorph') parts.push('with a lean, slender build');
  else if (user.body_type === 'mesomorph') parts.push('with an athletic, muscular build');
  else if (user.body_type === 'endomorph') parts.push('with a stocky, powerful build');

  // BMI-based description
  if (user.height_cm && user.weight_kg) {
    const heightM = Number(user.height_cm) / 100;
    const bmi = Number(user.weight_kg) / (heightM * heightM);
    if (bmi < 18.5) parts.push('and a thin frame');
    else if (bmi < 25) parts.push('and a fit frame');
    else if (bmi < 30) parts.push('and a solid, sturdy frame');
    else parts.push('and a heavy, powerful frame');
  }

  // Body proportions from measurements
  if (measurements) {
    const { chest_cm, waist_cm, hips_cm, shoulders_cm } = measurements;
    if (chest_cm && waist_cm && chest_cm / waist_cm > 1.2) {
      parts.push('with a V-taper torso');
    }
    if (shoulders_cm && waist_cm && shoulders_cm / waist_cm > 1.4) {
      parts.push('and broad shoulders');
    }
    if (hips_cm && waist_cm) {
      const ratio = waist_cm / hips_cm;
      if (ratio < 0.75) parts.push('with a defined waistline');
      else if (ratio > 0.9) parts.push('with a straight torso');
    }
    if (measurements.arm_cm && measurements.arm_cm > 38) {
      parts.push('with muscular arms');
    }
    if (measurements.thigh_cm && measurements.thigh_cm > 60) {
      parts.push('with powerful legs');
    }
  }

  // Fitness goal influences clothing/pose
  if (user.fitness_goal === 'build_muscle') {
    parts.push(', wearing a tank top and gym shorts, flexing pose in a gym');
  } else if (user.fitness_goal === 'lose_weight') {
    parts.push(', wearing activewear, jogging pose, outdoor trail background');
  } else if (user.fitness_goal === 'endurance') {
    parts.push(', wearing running gear, dynamic running pose, track background');
  } else {
    parts.push(', wearing athletic clothing, confident standing pose in a gym');
  }

  parts.push('. Game character art style, vibrant colors, neon accents, no text, no watermarks.');

  return parts.join(' ');
}

export async function POST(request: Request) {
  try {
    const xaiKey = process.env.XAI_API_KEY;
    if (!xaiKey) {
      return NextResponse.json(
        { error: 'Avatar generation is not configured' },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const ip = request.headers.get('x-forwarded-for') || userId;
    const { allowed, resetAt } = checkRateLimit(`avatar:${ip}`, 'avatar');
    if (!allowed) {
      return NextResponse.json(
        { error: 'Avatar generation rate limit reached. Try again later.', resetAt },
        { status: 429 }
      );
    }

    // Parse optional body measurements
    let measurements: BodyMeasurements | null = null;
    try {
      const body = await request.json();
      if (body.measurements && typeof body.measurements === 'object') {
        measurements = {};
        for (const key of MEASUREMENT_KEYS) {
          if (key in body.measurements) {
            const val = Number(body.measurements[key]);
            if (!isNaN(val) && val >= 10 && val <= 300) {
              (measurements as Record<string, number>)[key] = val;
            }
          }
        }
        if (Object.keys(measurements).length === 0) measurements = null;
      }
    } catch {
      // No body or invalid JSON — that's fine, measurements are optional
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build prompt and call xAI
    const prompt = buildPrompt(user, measurements);

    const xaiRes = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${xaiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-2-image',
        prompt,
        n: 1,
        response_format: 'b64_json',
      }),
    });

    if (!xaiRes.ok) {
      const errText = await xaiRes.text();
      console.error('xAI API error:', xaiRes.status, errText);
      return NextResponse.json(
        { error: 'Failed to generate avatar. Please try again.' },
        { status: 502 }
      );
    }

    const xaiData = await xaiRes.json();
    const b64Image = xaiData.data?.[0]?.b64_json;
    if (!b64Image) {
      return NextResponse.json(
        { error: 'No image returned from generation' },
        { status: 502 }
      );
    }

    // Upload to Supabase Storage
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Storage not configured' },
        { status: 503 }
      );
    }

    const timestamp = Date.now();
    const filePath = `${userId}/${timestamp}.png`;
    const buffer = Buffer.from(b64Image, 'base64');

    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload avatar' },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // Update user profile
    const updates: Record<string, unknown> = { avatar_url: avatarUrl };
    if (measurements) {
      updates.body_measurements = measurements;
    }

    const updatedUser = await updateUser(userId, updates);

    return NextResponse.json({
      user: updatedUser,
      avatar_url: avatarUrl,
    });
  } catch (error) {
    console.error('Avatar generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
