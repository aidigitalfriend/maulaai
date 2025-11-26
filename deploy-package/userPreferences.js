import express from 'express';
import UserPreferences from '../models/UserPreferences.js';
const router = express.Router();

// Get user preferences
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let preferences = await UserPreferences.findOne({ userId });
    
    if (!preferences) {
      // Create default preferences if none exist
      preferences = new UserPreferences({
        userId,
        theme: {
          mode: 'light',
          primaryColor: 'brand',
          fontSize: 'medium',
          compactMode: false
        },
        notifications: {
          email: {
            enabled: true,
            frequency: 'immediate',
            types: {
              system: true,
              security: true,
              updates: true,
              marketing: false,
              community: true
            }
          },
          push: {
            enabled: true,
            quiet: {
              enabled: false,
              start: '22:00',
              end: '08:00'
            }
          },
          desktop: {
            enabled: false,
            sound: true
          }
        },
        language: {
          primary: 'en',
          secondary: 'es',
          autoDetect: true
        },
        accessibility: {
          highContrast: false,
          reduceMotion: false,
          screenReader: false,
          keyboardNavigation: true
        },
        privacy: {
          profileVisibility: 'public',
          activityTracking: true,
          analytics: true,
          dataSharing: false
        },
        advanced: {
          autoSave: true,
          autoBackup: true,
          debugMode: false,
          betaFeatures: false
        }
      });
      await preferences.save();
    }

    res.json({
      success: true,
      preferences: preferences
    });
  } catch (error) {
    console.error('Preferences fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user preferences'
    });
  }
});

// Update user preferences
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      preferences: preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user preferences'
    });
  }
});

// Update theme preferences
router.patch('/:userId/theme', async (req, res) => {
  try {
    const { userId } = req.params;
    const { theme } = req.body;

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      { $set: { theme } },
      { new: true }
    );

    if (!preferences) {
      return res.status(404).json({
        success: false,
        error: 'Preferences not found'
      });
    }

    res.json({
      success: true,
      theme: preferences.theme,
      message: 'Theme preferences updated successfully'
    });
  } catch (error) {
    console.error('Theme update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update theme preferences'
    });
  }
});

// Update notification preferences
router.patch('/:userId/notifications', async (req, res) => {
  try {
    const { userId } = req.params;
    const { notifications } = req.body;

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      { $set: { notifications } },
      { new: true }
    );

    if (!preferences) {
      return res.status(404).json({
        success: false,
        error: 'Preferences not found'
      });
    }

    res.json({
      success: true,
      notifications: preferences.notifications,
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Notification update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification preferences'
    });
  }
});

// Update language preferences
router.patch('/:userId/language', async (req, res) => {
  try {
    const { userId } = req.params;
    const { language } = req.body;

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      { $set: { language } },
      { new: true }
    );

    if (!preferences) {
      return res.status(404).json({
        success: false,
        error: 'Preferences not found'
      });
    }

    res.json({
      success: true,
      language: preferences.language,
      message: 'Language preferences updated successfully'
    });
  } catch (error) {
    console.error('Language update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update language preferences'
    });
  }
});

// Update accessibility preferences
router.patch('/:userId/accessibility', async (req, res) => {
  try {
    const { userId } = req.params;
    const { accessibility } = req.body;

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      { $set: { accessibility } },
      { new: true }
    );

    if (!preferences) {
      return res.status(404).json({
        success: false,
        error: 'Preferences not found'
      });
    }

    res.json({
      success: true,
      accessibility: preferences.accessibility,
      message: 'Accessibility preferences updated successfully'
    });
  } catch (error) {
    console.error('Accessibility update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update accessibility preferences'
    });
  }
});

export default router;