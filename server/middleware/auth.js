const User = require('../models/User');
async function authenticateWallet(req, res, next) {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(401).json({ error: 'Wallet address required' });
    }
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
      });
      await user.save();
    } else {
      user.lastActive = new Date();
      await user.save();
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}
async function requireAuth(req, res, next) {
  try {
    const walletAddress = req.headers['x-wallet-address'];
    if (!walletAddress) {
      return res.status(401).json({ error: 'Wallet address required in headers' });
    }
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}
module.exports = {
  authenticateWallet,
  requireAuth,
};
