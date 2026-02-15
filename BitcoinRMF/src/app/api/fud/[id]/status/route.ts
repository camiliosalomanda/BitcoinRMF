import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return NextResponse.json(
    { error: 'Status changes for FUD analyses are now handled by community voting. Visit /review to participate.' },
    { status: 410 }
  );
}
