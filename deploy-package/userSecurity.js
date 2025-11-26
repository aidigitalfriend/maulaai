import express from 'express';
import UserSecurity from '../models/UserSecurity.js';
const router = express.Router();

// Get user security settings
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let security = await UserSecurity.findOne({ userId });
    
    if (!security) {
      // Create default security settings if none exist
      security = new UserSecurity({
        userId,
        twoFactorAuth: {
          enabled: false,
          method: 'none',
          backupCodes: []
        },
        trustedDevices: [],
        loginHistory: [],
        securityScore: 60,
        recommendations: [
          {
            type: 'warning',
            title: 'Enable Two-Factor Authentication',
            description: 'Add an extra layer of security to your account',
            priority: 'high'
          }
        ]
      });
      await security.save();
    }

    res.json({
      success: true,
      security: security
    });
  } catch (error) {
    console.error('Security fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch security settings'
    });
  }
});

// Enable two-factor authentication
router.post('/:userId/2fa/enable', async (req, res) => {
  try {
    const { userId } = req.params;
    const { method } = req.body;

    const security = await UserSecurity.findOneAndUpdate(
      { userId },
      {
        $set: {
          'twoFactorAuth.enabled': true,
          'twoFactorAuth.method': method,
          'twoFactorAuth.enabledDate': new Date()
        }
      },
      { new: true }
    );

    if (!security) {
      return res.status(404).json({
        success: false,
        error: 'Security settings not found'
      });
    }

    res.json({
      success: true,
      message: 'Two-factor authentication enabled',
      twoFactorAuth: security.twoFactorAuth
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enable two-factor authentication'
    });
  }
});

// Add trusted device
router.post('/:userId/devices', async (req, res) => {
  try {
    const { userId } = req.params;
    const deviceInfo = {
      ...req.body,
      addedDate: new Date(),
      lastSeen: new Date()
    };

    const security = await UserSecurity.findOneAndUpdate(
      { userId },
      { $push: { trustedDevices: deviceInfo } },
      { new: true }
    );

    if (!security) {
      return res.status(404).json({
        success: false,
        error: 'Security settings not found'
      });
    }

    res.json({
      success: true,
      message: 'Device added successfully',
      devices: security.trustedDevices
    });
  } catch (error) {
    console.error('Device add error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add trusted device'
    });
  }
});

// Remove trusted device
router.delete('/:userId/devices/:deviceId', async (req, res) => {
  try {
    const { userId, deviceId } = req.params;

    const security = await UserSecurity.findOneAndUpdate(
      { userId },
      { $pull: { trustedDevices: { _id: deviceId } } },
      { new: true }
    );

    if (!security) {
      return res.status(404).json({
        success: false,
        error: 'Security settings not found'
      });
    }

    res.json({
      success: true,
      message: 'Device removed successfully',
      devices: security.trustedDevices
    });
  } catch (error) {
    console.error('Device remove error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove trusted device'
    });
  }
});

// Add login history entry
router.post('/:userId/login-history', async (req, res) => {
  try {
    const { userId } = req.params;
    const loginEntry = {
      ...req.body,
      timestamp: new Date()
    };

    const security = await UserSecurity.findOneAndUpdate(
      { userId },
      { 
        $push: { 
          loginHistory: {
            $each: [loginEntry],
            $slice: -50 // Keep only last 50 entries
          }
        }
      },
      { new: true }
    );

    if (!security) {
      return res.status(404).json({
        success: false,
        error: 'Security settings not found'
      });
    }

    res.json({
      success: true,
      message: 'Login history updated',
      loginHistory: security.loginHistory
    });
  } catch (error) {
    console.error('Login history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update login history'
    });
  }
});

export default router;