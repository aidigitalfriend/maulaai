import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import {
  verifyRequest,
  unauthorizedResponse,
} from '../../../../lib/validateAuth';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || '';

let cachedConnection: typeof mongoose | null = null;

async function connectDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not configured');
  }
  
  cachedConnection = await mongoose.connect(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });
  
  return cachedConnection;
}

// Schema matching the 'subscriptions' collection structure (not agentsubscriptions)
const subscriptionSchema = new mongoose.Schema({
  userId: { type: String, index: true },  // Stored as string
  agentId: { type: String },
  plan: { type: String, enum: ['daily', 'weekly', 'monthly'] },
  price: { type: Number },
  status: { type: String, enum: ['active', 'expired', 'cancelled'] },
  startDate: { type: Date },
  expiryDate: { type: Date },
  autoRenew: { type: Boolean, default: false },
  stripeSubscriptionId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'subscriptions' });  // Real data is in 'subscriptions' collection

const Subscription = mongoose.models.UserSubscription || mongoose.model('UserSubscription', subscriptionSchema);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Require authentication for subscription endpoints
    const authResult = verifyRequest(request);
    if (!authResult.ok) return unauthorizedResponse(authResult.error);

    await connectDatabase();

    // Query subscriptions collection directly (userId is stored as string)
    const subscriptions = await Subscription.find({ 
      userId: userId 
    }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: subscriptions.length,
      subscriptions: subscriptions
    });
  } catch (err: any) {
    console.error('[/api/subscriptions/[userId]] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to fetch subscriptions',
        subscriptions: [],
      },
      { status: 500 }
    );
  }
}
