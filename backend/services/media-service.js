/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MEDIA PROCESSING SERVICE
 * Complete media pipeline for AI agents - Image, Video, Audio processing
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

// FFmpeg setup (uses static binaries)
let ffmpeg;
let ffmpegPath;
let ffprobePath;

try {
  const ffmpegStatic = await import('ffmpeg-static');
  const ffprobeStatic = await import('ffprobe-static');
  const fluentFfmpeg = await import('fluent-ffmpeg');
  
  ffmpegPath = ffmpegStatic.default;
  ffprobePath = ffprobeStatic.path;
  ffmpeg = fluentFfmpeg.default;
  
  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfprobePath(ffprobePath);
  
  console.log('[MediaService] FFmpeg initialized:', ffmpegPath);
} catch (err) {
  console.warn('[MediaService] FFmpeg not available:', err.message);
}

// API Keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Temp directory for processing
const TEMP_DIR = '/tmp/media-processing';

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (err) {
    // Directory exists
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * IMAGE GENERATION - DALL-E 3
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export async function generateImage(prompt, options = {}) {
  const {
    model = 'dall-e-3',
    size = '1024x1024',
    quality = 'standard',
    style = 'vivid',
    n = 1,
  } = options;

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  console.log(`[MediaService] Generating image: "${prompt.substring(0, 50)}..."`);

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n,
      size,
      quality,
      style,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[MediaService] DALL-E error:', error);
    throw new Error(`Image generation failed: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    success: true,
    images: data.data.map(img => ({
      url: img.url,
      revisedPrompt: img.revised_prompt,
    })),
    model,
    prompt,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * IMAGE EDITING - DALL-E with mask
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export async function editImage(imageBuffer, prompt, maskBuffer = null, options = {}) {
  const { size = '1024x1024', n = 1 } = options;

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  await ensureTempDir();

  // Convert image to PNG (required by DALL-E)
  const pngBuffer = await sharp(imageBuffer)
    .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  const formData = new FormData();
  formData.append('image', pngBuffer, { filename: 'image.png', contentType: 'image/png' });
  formData.append('prompt', prompt);
  formData.append('n', n.toString());
  formData.append('size', size);

  if (maskBuffer) {
    const maskPng = await sharp(maskBuffer).resize(1024, 1024).png().toBuffer();
    formData.append('mask', maskPng, { filename: 'mask.png', contentType: 'image/png' });
  }

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[MediaService] Image edit error:', error);
    throw new Error(`Image edit failed: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    success: true,
    images: data.data.map(img => ({ url: img.url })),
    prompt,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * IMAGE VARIATION - Create variations of an image
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export async function createImageVariation(imageBuffer, options = {}) {
  const { size = '1024x1024', n = 1 } = options;

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Convert to PNG
  const pngBuffer = await sharp(imageBuffer)
    .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  const formData = new FormData();
  formData.append('image', pngBuffer, { filename: 'image.png', contentType: 'image/png' });
  formData.append('n', n.toString());
  formData.append('size', size);

  const response = await fetch('https://api.openai.com/v1/images/variations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Image variation failed: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    success: true,
    images: data.data.map(img => ({ url: img.url })),
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * IMAGE PROCESSING - Resize, Convert, Transform
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export async function processImage(imageBuffer, operations = {}) {
  const {
    resize,           // { width, height, fit }
    format,           // 'jpeg' | 'png' | 'webp' | 'gif' | 'avif'
    quality,          // 1-100
    rotate,           // degrees
    flip,             // true/false
    flop,             // true/false (mirror)
    grayscale,        // true/false
    blur,             // sigma value
    sharpen,          // true/false
    brightness,       // 0.5-2
    contrast,         // 0.5-2
    saturation,       // 0.5-2
    crop,             // { left, top, width, height }
    watermark,        // { text, position }
  } = operations;

  let image = sharp(imageBuffer);

  // Apply operations
  if (resize) {
    image = image.resize(resize.width, resize.height, {
      fit: resize.fit || 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    });
  }

  if (rotate) {
    image = image.rotate(rotate);
  }

  if (flip) {
    image = image.flip();
  }

  if (flop) {
    image = image.flop();
  }

  if (grayscale) {
    image = image.grayscale();
  }

  if (blur) {
    image = image.blur(blur);
  }

  if (sharpen) {
    image = image.sharpen();
  }

  if (brightness || contrast || saturation) {
    image = image.modulate({
      brightness: brightness || 1,
      saturation: saturation || 1,
    });
    if (contrast && contrast !== 1) {
      image = image.linear(contrast, -(128 * (contrast - 1)));
    }
  }

  if (crop) {
    image = image.extract({
      left: crop.left || 0,
      top: crop.top || 0,
      width: crop.width,
      height: crop.height,
    });
  }

  // Output format
  switch (format) {
    case 'jpeg':
    case 'jpg':
      image = image.jpeg({ quality: quality || 80 });
      break;
    case 'png':
      image = image.png({ compressionLevel: Math.floor((100 - (quality || 80)) / 10) });
      break;
    case 'webp':
      image = image.webp({ quality: quality || 80 });
      break;
    case 'gif':
      image = image.gif();
      break;
    case 'avif':
      image = image.avif({ quality: quality || 50 });
      break;
    default:
      // Keep original format
      break;
  }

  const outputBuffer = await image.toBuffer();
  const metadata = await sharp(outputBuffer).metadata();

  return {
    success: true,
    buffer: outputBuffer,
    metadata: {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: outputBuffer.length,
    },
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * IMAGE FORMAT CONVERSION
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export async function convertImageFormat(imageBuffer, targetFormat, quality = 80) {
  return processImage(imageBuffer, { format: targetFormat, quality });
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * IMAGE ANALYSIS - Get image info and metadata
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export async function analyzeImage(imageBuffer) {
  const metadata = await sharp(imageBuffer).metadata();
  const stats = await sharp(imageBuffer).stats();
  const fileType = await fileTypeFromBuffer(imageBuffer);

  return {
    success: true,
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    space: metadata.space,
    channels: metadata.channels,
    depth: metadata.depth,
    density: metadata.density,
    hasAlpha: metadata.hasAlpha,
    orientation: metadata.orientation,
    size: imageBuffer.length,
    mimeType: fileType?.mime || `image/${metadata.format}`,
    isAnimated: metadata.pages > 1,
    stats: {
      dominant: stats.dominant,
      isOpaque: stats.isOpaque,
    },
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VIDEO PROCESSING (requires FFmpeg)
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export async function processVideo(inputPath, outputPath, options = {}) {
  if (!ffmpeg) {
    throw new Error('FFmpeg not available');
  }

  const {
    format,           // 'mp4' | 'webm' | 'avi' | 'gif'
    resize,           // { width, height }
    fps,              // frames per second
    bitrate,          // '1000k'
    trim,             // { start: '00:00:10', duration: '00:00:30' }
    mute,             // true/false
    rotate,           // 90, 180, 270
  } = options;

  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);

    if (trim?.start) {
      command = command.setStartTime(trim.start);
    }
    if (trim?.duration) {
      command = command.setDuration(trim.duration);
    }

    if (resize) {
      command = command.size(`${resize.width}x${resize.height}`);
    }

    if (fps) {
      command = command.fps(fps);
    }

    if (bitrate) {
      command = command.videoBitrate(bitrate);
    }

    if (mute) {
      command = command.noAudio();
    }

    if (rotate) {
      const filters = {
        90: 'transpose=1',
        180: 'transpose=2,transpose=2',
        270: 'transpose=2',
      };
      if (filters[rotate]) {
        command = command.videoFilters(filters[rotate]);
      }
    }

    command
      .output(outputPath)
      .on('end', () => {
        resolve({ success: true, output: outputPath });
      })
      .on('error', (err) => {
        reject(new Error(`Video processing failed: ${err.message}`));
      })
      .run();
  });
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VIDEO TO GIF CONVERSION
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export async function videoToGif(inputPath, outputPath, options = {}) {
  if (!ffmpeg) {
    throw new Error('FFmpeg not available');
  }

  const { width = 480, fps = 10, start, duration } = options;

  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);

    if (start) command = command.setStartTime(start);
    if (duration) command = command.setDuration(duration);

    command
      .size(`${width}x?`)
      .fps(fps)
      .output(outputPath)
      .on('end', () => resolve({ success: true, output: outputPath }))
      .on('error', (err) => reject(err))
      .run();
  });
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EXTRACT AUDIO FROM VIDEO
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export async function extractAudio(videoPath, audioPath, options = {}) {
  if (!ffmpeg) {
    throw new Error('FFmpeg not available');
  }

  const { format = 'mp3', bitrate = '192k' } = options;

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec(format === 'mp3' ? 'libmp3lame' : 'aac')
      .audioBitrate(bitrate)
      .output(audioPath)
      .on('end', () => resolve({ success: true, output: audioPath }))
      .on('error', (err) => reject(err))
      .run();
  });
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THUMBNAIL GENERATION FROM VIDEO
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export async function generateThumbnail(videoPath, outputPath, options = {}) {
  if (!ffmpeg) {
    throw new Error('FFmpeg not available');
  }

  const { timestamp = '00:00:01', size = '320x240' } = options;

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timestamp],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size,
      })
      .on('end', () => resolve({ success: true, output: outputPath }))
      .on('error', (err) => reject(err));
  });
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DOWNLOAD IMAGE FROM URL
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  
  const buffer = Buffer.from(await response.arrayBuffer());
  const fileType = await fileTypeFromBuffer(buffer);
  
  return {
    buffer,
    mimeType: fileType?.mime || 'application/octet-stream',
    extension: fileType?.ext || 'bin',
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SERVICE STATUS
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export function getServiceStatus() {
  return {
    imageProcessing: true,                      // Sharp is always available
    imageGeneration: !!OPENAI_API_KEY,          // DALL-E
    imageEditing: !!OPENAI_API_KEY,             // DALL-E edits
    videoProcessing: !!ffmpeg,                  // FFmpeg
    audioExtraction: !!ffmpeg,                  // FFmpeg
    thumbnailGeneration: !!ffmpeg,              // FFmpeg
    stabilityAI: !!STABILITY_API_KEY,           // Stable Diffusion
    replicate: !!REPLICATE_API_TOKEN,           // Replicate models
    ffmpegPath: ffmpegPath || 'not available',
    sharpVersion: sharp.versions?.sharp || 'installed',
  };
}

export default {
  generateImage,
  editImage,
  createImageVariation,
  processImage,
  convertImageFormat,
  analyzeImage,
  processVideo,
  videoToGif,
  extractAudio,
  generateThumbnail,
  downloadImage,
  getServiceStatus,
};
