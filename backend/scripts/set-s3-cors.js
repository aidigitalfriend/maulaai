/**
 * Script to set S3 CORS configuration
 * Run with: node scripts/set-s3-cors.js
 */

import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const corsConfig = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedOrigins: [
        'https://onelastai.com',
        'https://www.onelastai.com',
        'http://localhost:3000',
        'http://localhost:3100',
      ],
      ExposeHeaders: ['ETag', 'x-amz-meta-custom-header'],
      MaxAgeSeconds: 3600,
    },
  ],
};

async function setCors() {
  const bucket = process.env.AWS_S3_BUCKET || 'victorykit';
  
  try {
    console.log(`Setting CORS for bucket: ${bucket}`);
    
    await s3Client.send(
      new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: corsConfig,
      })
    );
    
    console.log('✅ CORS configuration set successfully!');
    
    // Verify the configuration
    const result = await s3Client.send(new GetBucketCorsCommand({ Bucket: bucket }));
    console.log('Current CORS config:', JSON.stringify(result.CORSRules, null, 2));
    
  } catch (error) {
    console.error('❌ Error setting CORS:', error.message);
    process.exit(1);
  }
}

setCors();
