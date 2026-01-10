import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const region = process.env.S3_REGION || process.env.AWS_REGION;
const bucket =
  process.env.S3_UPLOAD_BUCKET ||
  process.env.S3_BUCKET ||
  process.env.AWS_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!bucket || !region) {
  console.warn('S3 upload is not configured. Missing bucket or region.');
}

const s3Client = new S3Client({
  region: region || 'ap-southeast-1',
  credentials:
    accessKeyId && secretAccessKey
      ? {
          accessKeyId,
          secretAccessKey,
        }
      : undefined,
});

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function POST(request: NextRequest) {
  if (!bucket || !region) {
    return NextResponse.json(
      { message: 'S3 is not configured on this environment.' },
      { status: 500 }
    );
  }

  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { message: 'filename and contentType are required' },
        { status: 400 }
      );
    }

    const key = `chat-uploads/${Date.now()}-${crypto.randomUUID()}-${sanitizeFilename(filename)}`;

    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        // Note: ACL removed - using bucket policy for public read access instead
        // (bucket has "Bucket owner enforced" which disables ACLs)
      }),
      { expiresIn: 300 }
    );

    const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      key,
      expiresIn: 300,
    });
  } catch (error) {
    console.error('Presign upload error:', error);
    return NextResponse.json(
      { message: 'Failed to create upload URL' },
      { status: 500 }
    );
  }
}
