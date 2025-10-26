import { NextRequest, NextResponse } from 'next/server';

interface QuotaInfo {
  userId: string;
  agent: string;
  dailyUsage: number; // in seconds
  dailyLimit: number; // in seconds
  remaining: number; // in seconds
  lastReset: string; // ISO date string
  resetTime: string; // Next reset time
}

interface QuotaResponse {
  success: boolean;
  quotas?: QuotaInfo[];
  userSubscriptions?: string[];
  error?: string;
  metadata?: Record<string, any>;
}

// Daily limits per agent (in minutes)
const AGENT_DAILY_LIMITS = {
  'doctor-network': 15,
  'ip-info': 10,
  'general': 10,
  'custom': 5
};

// In-memory storage (in production, use Redis or database)
const quotaStorage = new Map<string, {
  [agent: string]: {
    dailyUsage: number;
    lastReset: string;
  };
}>();

class QuotaManager {
  static getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  static getNextResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  static getUserQuota(userId: string, agent: string): QuotaInfo {
    const today = this.getTodayKey();
    const userQuotas = quotaStorage.get(userId) || {};
    const agentQuota = userQuotas[agent] || { dailyUsage: 0, lastReset: today };

    // Reset if new day
    if (agentQuota.lastReset !== today) {
      agentQuota.dailyUsage = 0;
      agentQuota.lastReset = today;
      userQuotas[agent] = agentQuota;
      quotaStorage.set(userId, userQuotas);
    }

    const dailyLimitMinutes = AGENT_DAILY_LIMITS[agent as keyof typeof AGENT_DAILY_LIMITS] || 5;
    const dailyLimitSeconds = dailyLimitMinutes * 60;
    const remaining = Math.max(0, dailyLimitSeconds - agentQuota.dailyUsage);

    return {
      userId,
      agent,
      dailyUsage: agentQuota.dailyUsage,
      dailyLimit: dailyLimitSeconds,
      remaining,
      lastReset: agentQuota.lastReset,
      resetTime: this.getNextResetTime().toISOString()
    };
  }

  static getAllUserQuotas(userId: string): QuotaInfo[] {
    const agents = Object.keys(AGENT_DAILY_LIMITS);
    return agents.map(agent => this.getUserQuota(userId, agent));
  }

  static updateQuotaUsage(userId: string, agent: string, usedSeconds: number): QuotaInfo {
    const today = this.getTodayKey();
    const userQuotas = quotaStorage.get(userId) || {};
    const agentQuota = userQuotas[agent] || { dailyUsage: 0, lastReset: today };

    // Reset if new day
    if (agentQuota.lastReset !== today) {
      agentQuota.dailyUsage = 0;
      agentQuota.lastReset = today;
    }

    // Add usage
    agentQuota.dailyUsage += usedSeconds;
    userQuotas[agent] = agentQuota;
    quotaStorage.set(userId, userQuotas);

    return this.getUserQuota(userId, agent);
  }

  static checkQuotaAvailable(userId: string, agent: string, requiredSeconds: number): boolean {
    const quota = this.getUserQuota(userId, agent);
    return quota.remaining >= requiredSeconds;
  }

  static resetUserQuota(userId: string, agent?: string): void {
    if (agent) {
      // Reset specific agent quota
      const userQuotas = quotaStorage.get(userId) || {};
      if (userQuotas[agent]) {
        userQuotas[agent] = { dailyUsage: 0, lastReset: this.getTodayKey() };
        quotaStorage.set(userId, userQuotas);
      }
    } else {
      // Reset all quotas for user
      quotaStorage.delete(userId);
    }
  }

  static getSystemStats(): {
    totalUsers: number;
    totalUsage: number;
    agentUsage: Record<string, number>;
  } {
    let totalUsers = 0;
    let totalUsage = 0;
    const agentUsage: Record<string, number> = {};

    for (const [userId, userQuotas] of Array.from(quotaStorage.entries())) {
      totalUsers++;
      for (const [agent, quota] of Object.entries(userQuotas)) {
        totalUsage += quota.dailyUsage;
        agentUsage[agent] = (agentUsage[agent] || 0) + quota.dailyUsage;
      }
    }

    return { totalUsers, totalUsage, agentUsage };
  }
}

// GET: Retrieve quota information
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const agent = url.searchParams.get('agent');
    const stats = url.searchParams.get('stats') === 'true';

    // Admin stats endpoint
    if (stats) {
      const systemStats = QuotaManager.getSystemStats();
      return NextResponse.json({
        success: true,
        stats: systemStats,
        limits: AGENT_DAILY_LIMITS,
        metadata: {
          totalAgents: Object.keys(AGENT_DAILY_LIMITS).length,
          globalLimits: AGENT_DAILY_LIMITS
        }
      });
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId parameter is required'
      } as QuotaResponse, { status: 400 });
    }

    let quotas: QuotaInfo[];

    if (agent) {
      // Get specific agent quota
      quotas = [QuotaManager.getUserQuota(userId, agent)];
    } else {
      // Get all agent quotas for user
      quotas = QuotaManager.getAllUserQuotas(userId);
    }

    return NextResponse.json({
      success: true,
      quotas,
      metadata: {
        totalAgents: Object.keys(AGENT_DAILY_LIMITS).length,
        globalLimits: AGENT_DAILY_LIMITS
      }
    } as QuotaResponse);

  } catch (error) {
    console.error('Quota GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve quota information'
    } as QuotaResponse, { status: 500 });
  }
}

// POST: Update quota usage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, agent, usedSeconds, action } = body;

    if (!userId || !agent) {
      return NextResponse.json({
        success: false,
        error: 'userId and agent are required'
      } as QuotaResponse, { status: 400 });
    }

    if (action === 'check') {
      // Check if quota is available for estimated usage
      const requiredSeconds = usedSeconds || 10; // Default 10 seconds
      const available = QuotaManager.checkQuotaAvailable(userId, agent, requiredSeconds);
      const quota = QuotaManager.getUserQuota(userId, agent);

      return NextResponse.json({
        success: true,
        quotas: [quota],
        available,
        metadata: {
          requiredSeconds,
          sufficient: available,
          totalAgents: 0,
          globalLimits: AGENT_DAILY_LIMITS
        }
      } as QuotaResponse & { available: boolean });
    }

    if (action === 'reset') {
      // Admin action to reset quota
      QuotaManager.resetUserQuota(userId, agent);
      const quota = QuotaManager.getUserQuota(userId, agent);

      return NextResponse.json({
        success: true,
        quotas: [quota],
        metadata: {
          action: 'reset',
          resetAt: new Date().toISOString()
        }
      } as QuotaResponse);
    }

    // Default: update usage
    if (typeof usedSeconds !== 'number' || usedSeconds < 0) {
      return NextResponse.json({
        success: false,
        error: 'usedSeconds must be a positive number'
      } as QuotaResponse, { status: 400 });
    }

    const updatedQuota = QuotaManager.updateQuotaUsage(userId, agent, usedSeconds);

    return NextResponse.json({
      success: true,
      quotas: [updatedQuota],
      metadata: {
        action: 'update',
        usedSeconds,
        updatedAt: new Date().toISOString()
      }
    } as QuotaResponse);

  } catch (error) {
    console.error('Quota POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update quota'
    } as QuotaResponse, { status: 500 });
  }
}

// DELETE: Reset quotas
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const agent = url.searchParams.get('agent');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId parameter is required'
      } as QuotaResponse, { status: 400 });
    }

    QuotaManager.resetUserQuota(userId, agent || undefined);

    const quotas = agent 
      ? [QuotaManager.getUserQuota(userId, agent)]
      : QuotaManager.getAllUserQuotas(userId);

    return NextResponse.json({
      success: true,
      quotas,
      metadata: {
        action: 'reset',
        resetAgent: agent || 'all',
        resetAt: new Date().toISOString()
      }
    } as QuotaResponse);

  } catch (error) {
    console.error('Quota DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to reset quota'
    } as QuotaResponse, { status: 500 });
  }
}