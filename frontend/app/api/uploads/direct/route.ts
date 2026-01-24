import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

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

const s3Client = new S3Client({
  region,
  credentials:
    accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : undefined,
});

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Server-side file upload to S3 (bypasses CORS issues)
 * Accepts multipart/form-data with 'file' field
 */
export async function POST(request: NextRequest) {
  if (!bucket || !accessKeyId || !secretAccessKey) {
    return NextResponse.json(
      { success: false, message: 'S3 is not configured on this environment.' },
      { status: 500 }
    );
  }

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
    const key = `chat-uploads/${Date.now()}-${crypto.randomUUID()}-${sanitizedFilename}`;
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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
    const fileUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
      { expiresIn: 60 * 60 * 24 * 7 } // 7 days
    );

    console.log(`[upload] File uploaded: ${key}, size: ${file.size} bytes`);

    return NextResponse.json({
      success: true,
      fileUrl,
      key,
      filename: sanitizedFilename,
      size: file.size,
      contentType: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
