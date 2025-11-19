const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const File = require('../models/File');
const Activity = require('../models/Activity');
const { requireAuth } = require('../middleware/auth');
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, parentId, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    let path = `/${name}`;
    if (parentId) {
      const parent = await Folder.findById(parentId);
      if (!parent || parent.owner !== req.user.walletAddress) {
        return res.status(400).json({ error: 'Invalid parent folder' });
      }
      path = `${parent.path}/${name}`;
    }
    const folder = new Folder({
      name,
      owner: req.user.walletAddress,
      parent: parentId || null,
      path,
      color: color || '#1976d2',
    });
    await folder.save();
    const activity = new Activity({
      user: req.user.walletAddress,
      action: 'create_folder',
      resourceType: 'folder',
      resourceId: folder._id,
      resourceName: folder.name,
      ipAddress: req.ip,
    });
    await activity.save();
    res.json({
      success: true,
      folder,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/', requireAuth, async (req, res) => {
  try {
    const { parentId } = req.query;
    const query = { owner: req.user.walletAddress };
    if (parentId) {
      query.parent = parentId;
    } else if (parentId !== undefined) {
      query.parent = null; 
    }
    const folders = await Folder.find(query)
      .sort({ name: 1 })
      .populate('parent', 'name path');
    res.json({
      success: true,
      folders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id)
      .populate('parent', 'name path');
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    if (folder.owner !== req.user.walletAddress && !folder.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const subfolders = await Folder.find({
      parent: folder._id,
      owner: req.user.walletAddress,
    }).sort({ name: 1 });
    const files = await File.find({
      folder: folder._id,
      owner: req.user.walletAddress,
    }).sort({ uploadedAt: -1 });
    res.json({
      success: true,
      folder,
      subfolders,
      files,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    if (folder.owner !== req.user.walletAddress) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { name, color, isPublic } = req.body;
    if (name) {
      const oldPath = folder.path;
      const pathParts = oldPath.split('/');
      pathParts[pathParts.length - 1] = name;
      const newPath = pathParts.join('/');
      folder.name = name;
      folder.path = newPath;
      const subfolders = await Folder.find({
        owner: req.user.walletAddress,
        path: { $regex: `^${oldPath}/` },
      });
      for (const subfolder of subfolders) {
        subfolder.path = subfolder.path.replace(oldPath, newPath);
        await subfolder.save();
      }
    }
    if (color) folder.color = color;
    if (isPublic !== undefined) {
      folder.isPublic = isPublic;
      if (isPublic && !folder.shareLink) {
        folder.generateShareLink();
      } else if (!isPublic) {
        folder.shareLink = undefined;
      }
    }
    await folder.save();
    res.json({
      success: true,
      folder,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    if (folder.owner !== req.user.walletAddress) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const subfolders = await Folder.find({
      owner: req.user.walletAddress,
      path: { $regex: `^${folder.path}/` },
    });
    const allFolderIds = [folder._id, ...subfolders.map(f => f._id)];
    const files = await File.find({
      owner: req.user.walletAddress,
      folder: { $in: allFolderIds },
    });
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    await File.deleteMany({
      owner: req.user.walletAddress,
      folder: { $in: allFolderIds },
    });
    await Folder.deleteMany({
      _id: { $in: allFolderIds },
    });
    req.user.storageUsed -= totalSize;
    await req.user.save();
    const activity = new Activity({
      user: req.user.walletAddress,
      action: 'delete_folder',
      resourceType: 'folder',
      resourceId: folder._id,
      resourceName: folder.name,
      details: {
        filesDeleted: files.length,
        subfoldersDeleted: subfolders.length,
        spaceFreed: totalSize,
      },
      ipAddress: req.ip,
    });
    await activity.save();
    res.json({
      success: true,
      message: 'Folder and all contents deleted successfully',
      details: {
        filesDeleted: files.length,
        subfoldersDeleted: subfolders.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/share/:shareLink', async (req, res) => {
  try {
    const folder = await Folder.findOne({ shareLink: req.params.shareLink });
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found or not shared' });
    }
    if (!folder.isPublic) {
      return res.status(403).json({ error: 'Folder is not public' });
    }
    const files = await File.find({
      folder: folder._id,
      isPublic: true,
    }).sort({ uploadedAt: -1 });
    const subfolders = await Folder.find({
      parent: folder._id,
      isPublic: true,
    }).sort({ name: 1 });
    res.json({
      success: true,
      folder: {
        name: folder.name,
        path: folder.path,
        color: folder.color,
      },
      subfolders,
      files,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
