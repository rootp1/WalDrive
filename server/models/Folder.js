const mongoose = require('mongoose');
const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: String, 
    required: true,
    index: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null, 
  },
  path: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#1976d2', 
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
folderSchema.index({ owner: 1, parent: 1 });
folderSchema.index({ owner: 1, path: 1 });
folderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});
folderSchema.methods.generateShareLink = function() {
  if (this.isPublic && !this.shareLink) {
    this.shareLink = `folder-${this._id}-${Date.now().toString(36)}`;
  }
  return this.shareLink;
};
module.exports = mongoose.model('Folder', folderSchema);
