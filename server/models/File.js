const mongoose = require('mongoose');
const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  walrusId: {
    type: String,
    required: true,
    unique: true,
  },
  owner: {
    type: String, 
    required: true,
    index: true,
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null, 
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
  description: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
  }],
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  thumbnail: {
    type: String, 
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  views: {
    type: Number,
    default: 0,
  },
  downloads: {
    type: Number,
    default: 0,
  },
});
fileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});
fileSchema.methods.generateShareLink = function() {
  if (this.isPublic && !this.shareLink) {
    this.shareLink = `${this._id}-${Date.now().toString(36)}`;
  }
  return this.shareLink;
};
module.exports = mongoose.model('File', fileSchema);
