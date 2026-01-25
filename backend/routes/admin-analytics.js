import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Using Prisma-compatible model adapters
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastLoginAt: { $gte: last7Days } });
    const totalPageViews = await PageView.countDocuments();
    const totalEvents = await UserEvent.countDocuments();
    const signupEvents = await UserEvent.countDocuments({ eventName: 'signup' });
    const loginEvents = await UserEvent.countDocuments({ eventName: 'login' });

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers },
        pageViews: { total: totalPageViews },
        events: { total: totalEvents, signups: signupEvents, logins: loginEvents },
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to get admin stats' });
  }
});

router.get('/users', async (req, res) => {
  try {
    // Using Prisma-compatible model adapter
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .select('email name createdAt lastLoginAt');
    
    res.json({ success: true, data: { users } });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

export default router;
