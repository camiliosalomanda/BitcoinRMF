import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/security';
import { getUserById, updateUser } from '@/lib/db/users';
import type { BodyType, Gender, FitnessGoal } from '@/types';

const BODY_TYPES: BodyType[] = ['ectomorph', 'mesomorph', 'endomorph'];
const GENDERS: Gender[] = ['male', 'female', 'non_binary', 'prefer_not_to_say'];
const FITNESS_GOALS: FitnessGoal[] = ['lose_weight', 'build_muscle', 'maintain', 'endurance'];

const EDITABLE_FIELDS = [
  'display_name', 'avatar_url', 'height_cm', 'weight_kg',
  'body_type', 'date_of_birth', 'gender', 'fitness_goal',
  'body_measurements',
] as const;

const MEASUREMENT_KEYS = ['chest_cm', 'waist_cm', 'hips_cm', 'shoulders_cm', 'arm_cm', 'thigh_cm'];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const ip = request.headers.get('x-forwarded-for') || userId;
    const { allowed } = checkRateLimit(`profile:${ip}`, 'api');
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();

    // Whitelist fields
    const updates: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Validate individual fields
    const errors: string[] = [];

    if ('display_name' in updates) {
      const name = updates.display_name;
      if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 50) {
        errors.push('Display name must be 1-50 characters');
      } else {
        updates.display_name = name.trim();
      }
    }

    if ('avatar_url' in updates) {
      const url = updates.avatar_url;
      if (url !== null && url !== '') {
        if (typeof url !== 'string') {
          errors.push('Avatar URL must be a string');
        } else {
          try {
            new URL(url);
          } catch {
            errors.push('Avatar URL must be a valid URL');
          }
        }
      } else {
        updates.avatar_url = null;
      }
    }

    if ('height_cm' in updates) {
      const h = updates.height_cm;
      if (h !== null) {
        const num = Number(h);
        if (isNaN(num) || num < 50 || num > 300) {
          errors.push('Height must be between 50 and 300 cm');
        } else {
          updates.height_cm = num;
        }
      }
    }

    if ('weight_kg' in updates) {
      const w = updates.weight_kg;
      if (w !== null) {
        const num = Number(w);
        if (isNaN(num) || num < 20 || num > 500) {
          errors.push('Weight must be between 20 and 500 kg');
        } else {
          updates.weight_kg = num;
        }
      }
    }

    if ('body_type' in updates) {
      const bt = updates.body_type;
      if (bt !== null && !BODY_TYPES.includes(bt as BodyType)) {
        errors.push('Invalid body type');
      }
    }

    if ('date_of_birth' in updates) {
      const dob = updates.date_of_birth;
      if (dob !== null) {
        const date = new Date(dob as string);
        if (isNaN(date.getTime())) {
          errors.push('Invalid date of birth');
        } else {
          const age = (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
          if (age < 13) {
            errors.push('Must be at least 13 years old');
          } else if (age > 150) {
            errors.push('Invalid date of birth');
          }
        }
      }
    }

    if ('gender' in updates) {
      const g = updates.gender;
      if (g !== null && !GENDERS.includes(g as Gender)) {
        errors.push('Invalid gender');
      }
    }

    if ('fitness_goal' in updates) {
      const fg = updates.fitness_goal;
      if (fg !== null && !FITNESS_GOALS.includes(fg as FitnessGoal)) {
        errors.push('Invalid fitness goal');
      }
    }

    if ('body_measurements' in updates) {
      const bm = updates.body_measurements;
      if (bm !== null) {
        if (typeof bm !== 'object' || Array.isArray(bm)) {
          errors.push('Body measurements must be an object');
        } else {
          const bmObj = bm as Record<string, unknown>;
          for (const key of Object.keys(bmObj)) {
            if (!MEASUREMENT_KEYS.includes(key)) {
              errors.push(`Invalid measurement key: ${key}`);
            } else {
              const val = Number(bmObj[key]);
              if (isNaN(val) || val < 10 || val > 300) {
                errors.push(`${key} must be between 10 and 300 cm`);
              } else {
                bmObj[key] = val;
              }
            }
          }
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('. ') }, { status: 400 });
    }

    const updatedUser = await updateUser(userId, updates);
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
