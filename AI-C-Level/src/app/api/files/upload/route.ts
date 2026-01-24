/**
 * File Upload API Route
 * Handles secure file uploads for executive analysis
 * 
 * Security Features:
 * - Authentication required
 * - Rate limiting
 * - File type validation
 * - File size limits
 * - Malware scanning headers
 * - User-file association
 */

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { 
  verifyAuth, 
  checkRateLimit, 
  getClientId, 
  unauthorizedResponse, 
  rateLimitResponse,
  addSecurityHeaders,
  logSecurityEvent,
} from '@/lib/security';

// Allowed file types with strict validation
const ALLOWED_TYPES: Record<string, { 
  extensions: string[]; 
  maxSize: number; 
  category: string;
  magicBytes?: number[];  // For content validation
}> = {
  // Documents
  'application/pdf': { 
    extensions: ['.pdf'], 
    maxSize: 10 * 1024 * 1024, 
    category: 'document',
    magicBytes: [0x25, 0x50, 0x44, 0x46], // %PDF
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    extensions: ['.docx'], 
    maxSize: 10 * 1024 * 1024, 
    category: 'document',
    magicBytes: [0x50, 0x4B, 0x03, 0x04], // PK (ZIP)
  },
  'text/plain': { 
    extensions: ['.txt'], 
    maxSize: 5 * 1024 * 1024, 
    category: 'document' 
  },
  'text/csv': { 
    extensions: ['.csv'], 
    maxSize: 5 * 1024 * 1024, 
    category: 'spreadsheet' 
  },
  
  // Spreadsheets
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { 
    extensions: ['.xlsx'], 
    maxSize: 10 * 1024 * 1024, 
    category: 'spreadsheet',
    magicBytes: [0x50, 0x4B, 0x03, 0x04], // PK (ZIP)
  },
  
  // Images
  'image/png': { 
    extensions: ['.png'], 
    maxSize: 5 * 1024 * 1024, 
    category: 'image',
    magicBytes: [0x89, 0x50, 0x4E, 0x47], // PNG
  },
  'image/jpeg': { 
    extensions: ['.jpg', '.jpeg'], 
    maxSize: 5 * 1024 * 1024, 
    category: 'image',
    magicBytes: [0xFF, 0xD8, 0xFF], // JPEG
  },
};

// Dangerous patterns to block
const DANGEROUS_PATTERNS = [
  /\.exe$/i, /\.dll$/i, /\.bat$/i, /\.cmd$/i, /\.sh$/i,
  /\.js$/i, /\.vbs$/i, /\.ps1$/i, /\.php$/i, /\.asp$/i,
  /<script/i, /javascript:/i, /data:text\/html/i,
];

/**
 * Validate file content matches declared type
 */
function validateFileContent(buffer: ArrayBuffer, expectedType: string): boolean {
  const typeConfig = ALLOWED_TYPES[expectedType];
  if (!typeConfig?.magicBytes) return true; // No magic bytes to check
  
  const bytes = new Uint8Array(buffer);
  const magicBytes = typeConfig.magicBytes;
  
  for (let i = 0; i < magicBytes.length; i++) {
    if (bytes[i] !== magicBytes[i]) return false;
  }
  
  return true;
}

/**
 * Check for dangerous content in filename
 */
function isDangerousFilename(filename: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(filename));
}

/**
 * Sanitize filename
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 100);
}

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    // === AUTHENTICATION ===
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      logSecurityEvent({
        type: 'unauthorized',
        ip: clientId,
        userAgent,
        details: 'Unauthorized file upload attempt',
      });
      return addSecurityHeaders(unauthorizedResponse(auth.error));
    }

    // === RATE LIMITING ===
    const rateLimitKey = `upload:${auth.userId}`;
    const { allowed, remaining, resetIn } = checkRateLimit(rateLimitKey, 'upload');
    
    if (!allowed) {
      logSecurityEvent({
        type: 'rate_limit',
        userId: auth.userId,
        ip: clientId,
        userAgent,
        details: 'File upload rate limit exceeded',
      });
      return addSecurityHeaders(rateLimitResponse(resetIn));
    }

    // === FILE PARSING ===
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const executive = formData.get('executive') as string | null;

    if (!file) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'No file provided' }, { status: 400 })
      );
    }

    // === SECURITY VALIDATIONS ===
    
    // 1. Check filename for dangerous patterns
    if (isDangerousFilename(file.name)) {
      logSecurityEvent({
        type: 'suspicious',
        userId: auth.userId,
        ip: clientId,
        userAgent,
        details: `Dangerous filename blocked: ${file.name}`,
      });
      return addSecurityHeaders(
        NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
      );
    }

    // 2. Validate MIME type
    const fileType = ALLOWED_TYPES[file.type];
    if (!fileType) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: `File type not supported: ${file.type}` },
          { status: 400 }
        )
      );
    }

    // 3. Validate file size
    if (file.size > fileType.maxSize) {
      const maxSizeMB = fileType.maxSize / (1024 * 1024);
      return addSecurityHeaders(
        NextResponse.json(
          { error: `File too large. Maximum size is ${maxSizeMB}MB` },
          { status: 400 }
        )
      );
    }

    // 4. Validate file extension matches MIME type
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!fileType.extensions.includes(ext)) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'File extension does not match file type' },
          { status: 400 }
        )
      );
    }

    // 5. Validate file content (magic bytes)
    const buffer = await file.arrayBuffer();
    if (!validateFileContent(buffer, file.type)) {
      logSecurityEvent({
        type: 'suspicious',
        userId: auth.userId,
        ip: clientId,
        userAgent,
        details: `File content mismatch: ${file.name} declared as ${file.type}`,
      });
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'File content does not match declared type' },
          { status: 400 }
        )
      );
    }

    // === UPLOAD TO SECURE STORAGE ===
    const timestamp = Date.now();
    const safeFilename = sanitizeFilename(file.name);
    const blobPath = `uploads/${auth.userId}/${timestamp}-${safeFilename}`;

    // Check if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // Fallback: Return metadata without actual storage
      // In production, this should fail or use alternative storage
      console.warn('BLOB_READ_WRITE_TOKEN not configured - file not persisted');
      
      const fileMetadata = {
        id: `file-${timestamp}`,
        originalName: file.name,
        fileName: safeFilename,
        mimeType: file.type,
        size: file.size,
        category: fileType.category,
        executive: executive || null,
        uploadedBy: auth.userId,
        uploadedAt: new Date().toISOString(),
        url: null, // No URL without blob storage
        warning: 'File storage not configured - file not persisted',
      };

      return addSecurityHeaders(
        NextResponse.json({
          message: 'File validated but storage not configured',
          file: fileMetadata,
        })
      );
    }

    // Upload to Vercel Blob
    const blob = await put(blobPath, buffer, {
      access: 'public', // Or 'private' with signed URLs
      contentType: file.type,
      addRandomSuffix: true,
    });

    // Create file metadata
    const fileMetadata = {
      id: blob.url.split('/').pop() || `file-${timestamp}`,
      originalName: file.name,
      fileName: safeFilename,
      mimeType: file.type,
      size: file.size,
      category: fileType.category,
      executive: executive || null,
      uploadedBy: auth.userId,
      uploadedAt: new Date().toISOString(),
      url: blob.url,
    };

    // Log successful upload
    logSecurityEvent({
      type: 'auth_success',
      userId: auth.userId,
      ip: clientId,
      userAgent,
      details: `File uploaded: ${safeFilename} (${file.size} bytes)`,
    });

    const response = NextResponse.json({
      message: 'File uploaded successfully',
      file: fileMetadata,
    });

    response.headers.set('X-RateLimit-Remaining', String(remaining));
    
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('File upload error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    );
  }
}

export async function GET(request: NextRequest) {
  // Public endpoint - return supported file types
  const supportedTypes = Object.entries(ALLOWED_TYPES).map(([mimeType, config]) => ({
    mimeType,
    extensions: config.extensions,
    maxSize: config.maxSize,
    category: config.category,
  }));

  return addSecurityHeaders(
    NextResponse.json({ supportedTypes })
  );
}
