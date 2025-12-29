/**
 * FAVORITES ROUTES
 * Handles user favorites for agents, tools, content
 */

import express from 'express';
import { UserFavorites } from '../models/UserFavorites.js';

const router = express.Router();

/**
 * Add to favorites
 */
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      type,
      itemId,
      itemSlug,
      itemTitle,
      metadata,
      folder,
      notes,
    } = req.body;

    if (!userId || !type || !itemId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if already favorited
    const existing = await UserFavorites.findOne({ userId, type, itemId });
    if (existing) {
      return res.status(400).json({
        error: 'Already in favorites',
        favoriteId: existing._id,
      });
    }

    const favorite = new UserFavorites({
      userId,
      type,
      itemId,
      itemSlug,
      itemTitle,
      metadata,
      folder,
      notes,
    });

    await favorite.save();

    res.json({
      success: true,
      favorite: {
        id: favorite._id,
        type: favorite.type,
        itemId: favorite.itemId,
        itemTitle: favorite.itemTitle,
      },
      message: 'Added to favorites',
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

/**
 * Get user's favorites
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, folder } = req.query;

    const filter = { userId };
    if (type) filter.type = type;
    if (folder) filter.folder = folder;

    const favorites = await UserFavorites.find(filter).sort({
      favoritedAt: -1,
    });

    // Group by type for easier frontend use
    const grouped = favorites.reduce((acc, fav) => {
      if (!acc[fav.type]) acc[fav.type] = [];
      acc[fav.type].push(fav);
      return acc;
    }, {});

    res.json({
      success: true,
      favorites,
      grouped,
      total: favorites.length,
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

/**
 * Check if item is favorited
 */
router.get('/check/:userId/:type/:itemId', async (req, res) => {
  try {
    const { userId, type, itemId } = req.params;

    const favorite = await UserFavorites.findOne({ userId, type, itemId });

    res.json({
      success: true,
      isFavorited: !!favorite,
      favorite: favorite || null,
    });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Failed to check favorite' });
  }
});

/**
 * Update favorite (notes, folder, etc.)
 */
router.patch('/:favoriteId', async (req, res) => {
  try {
    const { favoriteId } = req.params;
    const { notes, folder, color, sortOrder } = req.body;

    const favorite = await UserFavorites.findById(favoriteId);

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    if (notes !== undefined) favorite.notes = notes;
    if (folder !== undefined) favorite.folder = folder;
    if (color !== undefined) favorite.color = color;
    if (sortOrder !== undefined) favorite.sortOrder = sortOrder;

    await favorite.save();

    res.json({
      success: true,
      favorite,
      message: 'Favorite updated',
    });
  } catch (error) {
    console.error('Error updating favorite:', error);
    res.status(500).json({ error: 'Failed to update favorite' });
  }
});

/**
 * Remove from favorites
 */
router.delete('/:userId/:type/:itemId', async (req, res) => {
  try {
    const { userId, type, itemId } = req.params;

    const result = await UserFavorites.deleteOne({ userId, type, itemId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

/**
 * Track favorite usage (when user accesses the favorited item)
 */
router.post('/:favoriteId/use', async (req, res) => {
  try {
    const { favoriteId } = req.params;

    const favorite = await UserFavorites.findById(favoriteId);

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    favorite.usageCount += 1;
    favorite.lastUsed = new Date();
    await favorite.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
});

/**
 * Get favorite folders for user
 */
router.get('/folders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const folders = await UserFavorites.distinct('folder', {
      userId,
      folder: { $exists: true, $ne: null },
    });

    res.json({
      success: true,
      folders,
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

export default router;
