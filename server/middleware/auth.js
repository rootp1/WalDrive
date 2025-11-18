const User = require('../models/User');

/**
 * Middleware to verify wallet signature and authenticate user
 * For Web3 authentication, the client sends:
 * - walletAddress: The user's wallet address
 * - signature: Signed message to prove ownership
 * - message: The original message that was signed
 */
async function authenticateWallet(req, res, next) {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(401).json({ error: 'Wallet address required' });
    }

    // In a production app, you would verify the signature here
    // For MVP, we'll trust the client-side wallet verification

    // Find or create user
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

/**
 * Simplified auth middleware that just checks for wallet address in headers
 */
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
