const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: String, // Wallet address
    required: true,
    index: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null, // null means root level
  },
  path: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#1976d2', // Default blue
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  shareLink: {
    type: String,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient queries
folderSchema.index({ owner: 1, parent: 1 });
folderSchema.index({ owner: 1, path: 1 });

// Update timestamp
folderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate share link if public
folderSchema.methods.generateShareLink = function() {
  if (this.isPublic && !this.shareLink) {
    this.shareLink = `folder-${this._id}-${Date.now().toString(36)}`;
  }
  return this.shareLink;
};

module.exports = mongoose.model('Folder', folderSchema);
