import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    await dbConnect();

    const sessionUser = await User.findOne({
      sessionId,
      sessionExpiry: { $gt: new Date() },
    }).select('-password');

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    if (sessionUser._id.toString() !== params.userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const formData = await request.formData();
    const avatar = formData.get('avatar');

    if (!avatar || typeof avatar === 'string') {
      return NextResponse.json(
        { message: 'No avatar file uploaded' },
        { status: 400 }
      );
    }

    const fileArrayBuffer = await avatar.arrayBuffer();
    const fileSize = fileArrayBuffer.byteLength;

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { message: 'File too large. Max size is 2MB.' },
        { status: 400 }
      );
    }

    const mimeType = avatar.type || 'image/png';

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { message: 'Unsupported file type. Use PNG, JPEG, or WEBP.' },
        { status: 400 }
      );
    }

    const base64 = Buffer.from(fileArrayBuffer).toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const updatedUser = await User.findByIdAndUpdate(
      params.userId,
      {
        $set: {
          avatar: dataUrl,
          updatedAt: new Date(),
        },
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Avatar updated successfully',
        avatar: updatedUser.avatar,
        avatarUrl: updatedUser.avatar,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile avatar upload error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
