const mongoose = require('mongoose');
const activitySchema = new mongoose.Schema({
  user: {
    type: String, 
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['upload', 'download', 'delete', 'share', 'create_folder', 'delete_folder', 'update', 'view'],
  },
  resourceType: {
    type: String,
    enum: ['file', 'folder'],
    required: true,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  resourceName: {
    type: String,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});
activitySchema.index({ user: 1, timestamp: -1 });
activitySchema.index({ user: 1, action: 1, timestamp: -1 });
module.exports = mongoose.model('Activity', activitySchema);
