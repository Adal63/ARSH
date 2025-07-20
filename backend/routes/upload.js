const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'private', // Files are private by default
    key: function (req, file, cb) {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      cb(null, `uploads/${fileName}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'), false);
    }
  }
});

// Apply authentication to all routes
router.use(authenticateToken);

// Upload single file
router.post('/single', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    message: 'File uploaded successfully',
    file: {
      key: req.file.key,
      location: req.file.location,
      bucket: req.file.bucket,
      originalName: req.file.originalname,
      size: req.file.size,
      contentType: req.file.contentType
    }
  });
});

// Upload multiple files
router.post('/multiple', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const files = req.files.map(file => ({
    key: file.key,
    location: file.location,
    bucket: file.bucket,
    originalName: file.originalname,
    size: file.size,
    contentType: file.contentType
  }));

  res.json({
    message: 'Files uploaded successfully',
    files
  });
});

// Get signed URL for private file access
router.get('/signed-url/:key', (req, res) => {
  const key = req.params.key;
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Expires: 3600 // URL expires in 1 hour
  };

  s3.getSignedUrl('getObject', params, (err, url) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to generate signed URL' });
    }
    
    res.json({ url });
  });
});

// Delete file
router.delete('/:key', (req, res) => {
  const key = req.params.key;
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key
  };

  s3.deleteObject(params, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete file' });
    }
    
    res.json({ message: 'File deleted successfully' });
  });
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  if (error.message === 'Only images and PDF files are allowed') {
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ error: 'Upload failed' });
});

module.exports = router;