import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Increase body size limit for file uploads (50MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

const region = process.env.S3_REGION || process.env.AWS_REGION || 'ap-southeast-1';
const bucket =
  process.env.S3_UPLOAD_BUCKET ||
  process.env.S3_BUCKET ||
  process.env.AWS_S3_BUCKET ||
  'victorykit';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// Only create S3 client if credentials exist
let s3Client: S3Client | null = null;
if (accessKeyId && secretAccessKey) {
  s3Client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Server-side file upload with S3 or local fallback
 * Accepts multipart/form-data with 'file' field
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: `File type ${file.type} not allowed` },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File too large (max 50MB)' },
        { status: 400 }
      );
    }

    const sanitizedFilename = sanitizeFilename(file.name);
    const uniqueId = `${Date.now()}-${crypto.randomUUID()}`;
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try S3 upload first, fall back to local storage
    let fileUrl: string;
    let storageType: 'S3' | 'local' | 'base64' = 'S3';

    if (s3Client && bucket) {
      try {
        const key = `chat-uploads/${uniqueId}-${sanitizedFilename}`;
        
        // Upload to S3
        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: file.type,
          })
        );

        // Generate a signed URL for reading the file (valid for 7 days)
        const { GetObjectCommand } = await import('@aws-sdk/client-s3');
        fileUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
          { expiresIn: 60 * 60 * 24 * 7 } // 7 days
        );

        console.log(`[upload] S3 upload success: ${key}, size: ${file.size} bytes`);
      } catch (s3Error: unknown) {
        const errorMessage = s3Error instanceof Error ? s3Error.message : 'Unknown S3 error';
        console.warn(`[upload] S3 upload failed, using local fallback: ${errorMessage}`);
        storageType = 'local';
      }
    } else {
      storageType = 'local';
    }

    // Fallback to local storage
    if (storageType === 'local') {
      try {
        // Create uploads directory in public folder
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'chat');
        await fs.mkdir(uploadsDir, { recursive: true });

        const localFilename = `${uniqueId}-${sanitizedFilename}`;
        const localPath = path.join(uploadsDir, localFilename);
        
        await fs.writeFile(localPath, buffer);
        
        // URL for the uploaded file
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maula.ai';
        fileUrl = `${baseUrl}/uploads/chat/${localFilename}`;
        
        console.log(`[upload] Local upload success: ${localPath}, size: ${file.size} bytes`);
      } catch (localError: unknown) {
        const errorMessage = localError instanceof Error ? localError.message : 'Unknown local error';
        console.warn(`[upload] Local storage failed, using base64 fallback: ${errorMessage}`);
        storageType = 'base64';
      }
    }

    // Final fallback: base64 data URL (for small files only)
    if (storageType === 'base64') {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'File too large for base64 storage (max 5MB without S3)' },
          { status: 400 }
        );
      }
      fileUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
      console.log(`[upload] Base64 fallback used for: ${sanitizedFilename}`);
    }

    return NextResponse.json({
      success: true,
      fileUrl: fileUrl!,
      filename: sanitizedFilename,
      size: file.size,
      contentType: file.type,
      storageType,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
