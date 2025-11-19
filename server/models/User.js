const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  displayName: {
    type: String,
    default: function() {
      return `User_${this.walletAddress.substring(0, 6)}`;
    }
  },
  storageUsed: {
    type: Number,
    default: 0, 
  },
  storageLimit: {
    type: Number,
    default: 5368709120, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
});
userSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});
module.exports = mongoose.model('User', userSchema);
