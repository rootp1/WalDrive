const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const File = require('../models/File');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { requireAuth } = require('../middleware/auth');
const { uploadToWalrus, downloadFromWalrus, deleteCachedFile, getAggregatorUrl, UPLOAD_DIR } = require('../utils/walrus');
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600, 
  },
});
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  let uploadedFilePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    uploadedFilePath = req.file.path;
    const { folderId, isPublic, description, tags } = req.body;
    const walrusId = await uploadToWalrus(uploadedFilePath);
    const existingFile = await File.findOne({ walrusId, owner: req.user.walletAddress });
    if (existingFile) {
      if (uploadedFilePath) {
        await fs.unlink(uploadedFilePath).catch(() => {});
      }
      return res.status(409).json({ 
        error: 'This file has already been uploaded',
        existingFile: existingFile 
      });
    }
    const fileRecord = new File({
      name: req.file.originalname,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      walrusId,
      owner: req.user.walletAddress,
      folder: folderId || null,
      isPublic: isPublic === 'true' || isPublic === true,
      description: description || '',
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
    });
    if (fileRecord.isPublic) {
      fileRecord.generateShareLink();
    }
    await fileRecord.save();
    req.user.storageUsed += req.file.size;
    await req.user.save();
    const activity = new Activity({
      user: req.user.walletAddress,
      action: 'upload',
      resourceType: 'file',
      resourceId: fileRecord._id,
      resourceName: fileRecord.name,
      details: {
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
      },
      ipAddress: req.ip,
    });
    await activity.save();
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(() => {});
    }
    res.json({
      success: true,
      file: fileRecord,
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(() => {});
    }
    res.status(500).json({ error: error.message });
  }
});
router.get('/', requireAuth, async (req, res) => {
  try {
    const { folderId, search } = req.query;
    const query = { owner: req.user.walletAddress };
    if (folderId) {
      query.folder = folderId;
    } else if (folderId !== undefined) {
      query.folder = null; 
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const files = await File.find(query)
      .sort({ uploadedAt: -1 })
      .populate('folder', 'name path');
    res.json({
      success: true,
      files,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    if (file.owner !== req.user.walletAddress && !file.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({
      success: true,
      file,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/:id/download', requireAuth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    if (file.owner !== req.user.walletAddress && !file.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }
    file.downloads += 1;
    await file.save();
    const activity = new Activity({
      user: req.user.walletAddress,
      action: 'download',
      resourceType: 'file',
      resourceId: file._id,
      resourceName: file.name,
      ipAddress: req.ip,
    });
    await activity.save();
    const walrusUrl = getAggregatorUrl(file.walrusId);
    res.json({
      success: true,
      url: walrusUrl,
      filename: file.originalName,
      blobId: file.walrusId
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});
router.get('/:id/preview', requireAuth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    if (file.owner !== req.user.walletAddress && !file.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }
    file.views += 1;
    await file.save();
    const walrusUrl = getAggregatorUrl(file.walrusId);
    res.json({
      success: true,
      url: walrusUrl,
      mimeType: file.mimeType,
      blobId: file.walrusId
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: error.message });
  }
});
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    if (file.owner !== req.user.walletAddress) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { name, isPublic, description, tags, folderId } = req.body;
    if (name) file.name = name;
    if (description !== undefined) file.description = description;
    if (tags) file.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    if (folderId !== undefined) file.folder = folderId || null;
    if (isPublic !== undefined) {
      file.isPublic = isPublic;
      if (isPublic && !file.shareLink) {
        file.generateShareLink();
      } else if (!isPublic) {
        file.shareLink = undefined;
      }
    }
    await file.save();
    const activity = new Activity({
      user: req.user.walletAddress,
      action: 'update',
      resourceType: 'file',
      resourceId: file._id,
      resourceName: file.name,
      details: { changes: req.body },
      ipAddress: req.ip,
    });
    await activity.save();
    res.json({
      success: true,
      file,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    if (file.owner !== req.user.walletAddress) {
      return res.status(403).json({ error: 'Access denied' });
    }
    req.user.storageUsed -= file.size;
    await req.user.save();
    const activity = new Activity({
      user: req.user.walletAddress,
      action: 'delete',
      resourceType: 'file',
      resourceId: file._id,
      resourceName: file.name,
      details: {
        size: file.size,
        walrusId: file.walrusId,
      },
      ipAddress: req.ip,
    });
    await activity.save();
    await deleteCachedFile(file.walrusId);
    await File.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/share/:shareLink', async (req, res) => {
  try {
    const file = await File.findOne({ shareLink: req.params.shareLink });
    if (!file) {
      return res.status(404).json({ error: 'File not found or not shared' });
    }
    if (!file.isPublic) {
      return res.status(403).json({ error: 'File is not public' });
    }
    res.json({
      success: true,
      file: {
        _id: file._id,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        description: file.description,
        uploadedAt: file.uploadedAt,
        aggregatorUrl: getAggregatorUrl(file.walrusId),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
