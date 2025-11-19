const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateWallet } = require('../middleware/auth');
router.post('/login', authenticateWallet, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        walletAddress: req.user.walletAddress,
        displayName: req.user.displayName,
        storageUsed: req.user.storageUsed,
        storageLimit: req.user.storageLimit,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/me', async (req, res) => {
  try {
    const walletAddress = req.headers['x-wallet-address'];
    if (!walletAddress) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        displayName: user.displayName,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put('/profile', async (req, res) => {
  try {
    const walletAddress = req.headers['x-wallet-address'];
    const { displayName } = req.body;
    if (!walletAddress) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (displayName) {
      user.displayName = displayName;
    }
    await user.save();
    res.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
