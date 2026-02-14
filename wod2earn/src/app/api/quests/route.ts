import { NextResponse } from 'next/server';
import { getAllQuests } from '@/lib/db/quests';
import type { DifficultyLevel, QuestCategory, RecoveryLevel } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty') as DifficultyLevel | null;
    const category = searchParams.get('category') as QuestCategory | null;
    const recovery_level = searchParams.get('recovery_level') as RecoveryLevel | null;

    const quests = await getAllQuests({
      difficulty: difficulty || undefined,
      category: category || undefined,
      recovery_level: recovery_level || undefined,
    });

    return NextResponse.json({ quests });
  } catch (error) {
    console.error('Quests API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
