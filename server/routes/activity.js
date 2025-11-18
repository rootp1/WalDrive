const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/activity
 * Get activity log for the authenticated user
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { limit = 50, skip = 0, action, resourceType } = req.query;

    const query = { user: req.user.walletAddress };

    if (action) {
      query.action = action;
    }

    if (resourceType) {
      query.resourceType = resourceType;
    }

    const activities = await Activity.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      activities,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/activity/stats
 * Get activity statistics
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await Activity.aggregate([
      {
        $match: {
          user: req.user.walletAddress,
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get daily activity
    const dailyActivity = await Activity.aggregate([
      {
        $match: {
          user: req.user.walletAddress,
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      success: true,
      stats: {
        byAction: stats,
        daily: dailyActivity,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/activity/clear
 * Clear old activity logs
 */
router.delete('/clear', requireAuth, async (req, res) => {
  try {
    const { days = 30 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await Activity.deleteMany({
      user: req.user.walletAddress,
      timestamp: { $lt: cutoffDate },
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} old activity logs`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
