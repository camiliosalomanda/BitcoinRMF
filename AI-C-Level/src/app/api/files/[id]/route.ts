/**
 * File Retrieval API Route
 * Serves uploaded files by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// MIME type mapping
const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.txt': 'text/plain',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.csv': 'text/csv',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.ppt': 'application/vnd.ms-powerpoint',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const uploadsDir = path.join(process.cwd(), 'uploads');

    // Find file with matching ID
    const files = await findFileById(uploadsDir, id);
    
    if (!files) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const filePath = path.join(uploadsDir, files);
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(filePath);
    const ext = path.extname(files).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${files}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('File retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file' },
      { status: 500 }
    );
  }
}

async function findFileById(dir: string, id: string): Promise<string | null> {
  const { readdir } = await import('fs/promises');
  
  try {
    const files = await readdir(dir);
    const matchingFile = files.find(f => f.startsWith(id));
    return matchingFile || null;
  } catch {
    return null;
  }
}
