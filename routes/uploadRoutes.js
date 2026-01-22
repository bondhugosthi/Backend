const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const { getGridFSBucket } = require('../utils/gridfs');

const buildFileUrl = (req, id) => `${req.protocol}://${req.get('host')}/api/upload/file/${id}`;

const saveToGridFS = (bucket, file) => new Promise((resolve, reject) => {
  const uploadStream = bucket.openUploadStream(file.originalname, {
    contentType: file.mimetype,
    metadata: {
      originalName: file.originalname,
      uploadedAt: new Date()
    }
  });

  uploadStream.on('finish', () => resolve(uploadStream));
  uploadStream.on('error', reject);
  uploadStream.end(file.buffer);
});

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const bucket = getGridFSBucket();
    const uploadStream = await saveToGridFS(bucket, req.file);
    const fileId = uploadStream.id.toString();

    res.json({
      message: 'File uploaded successfully',
      url: buildFileUrl(req, fileId),
      fileId,
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
router.post('/images', protect, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const bucket = getGridFSBucket();
    const uploaded = await Promise.all(
      req.files.map((file) => saveToGridFS(bucket, file))
    );
    const fileUrls = uploaded.map((stream, index) => ({
      url: buildFileUrl(req, stream.id.toString()),
      fileId: stream.id.toString(),
      filename: req.files[index].originalname,
      contentType: req.files[index].mimetype
    }));

    res.json({
      message: 'Files uploaded successfully',
      files: fileUrls
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// @desc    Stream file by id
// @route   GET /api/upload/file/:id
// @access  Public
router.get('/file/:id', async (req, res) => {
  try {
    let fileId;
    try {
      fileId = new mongoose.Types.ObjectId(req.params.id);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid file id' });
    }

    const bucket = getGridFSBucket();
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Length', file.length);
    res.set('Cache-Control', 'public, max-age=31536000');

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to read file' });
      }
    });
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch file', error: error.message });
  }
});

module.exports = router;
