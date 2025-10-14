const express = require('express');
const aws = require('aws-sdk');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const port = 3000;

const s3 = new aws.S3({
  accessKeyId: 'AKIAXWMA6SRA44EUF6TO',
  secretAccessKey: '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',
  region: 'eu-north-1',
});

const BUCKET_NAME = 'iqspace';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Upload endpoint
app.post('/upload', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req, res) => {
  try {
    const { userId, contentType } = req.body;
    if (!userId || !contentType) {
      return res.status(400).json({ error: 'Missing userId or contentType' });
    }

    const timestamp = Date.now();
    const audioFile = req.files.audio?.[0];
    let coverImageUrl = '';

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Sanitize audio file name
    const sanitizedAudioName = audioFile.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const audioKey = `${contentType}/${userId}/${timestamp}-${sanitizedAudioName}`;

    // Upload audio to S3
    const audioParams = {
      Bucket: BUCKET_NAME,
      Key: audioKey,
      Body: audioFile.buffer,
      ContentType: audioFile.mimetype,
    };
    const audioData = await s3.upload(audioParams).promise();

    // Upload cover image if provided
    if (req.files.coverImage?.[0]) {
      const coverImage = req.files.coverImage[0];
      const coverImageKey = `images/${userId}/${timestamp}-cover.jpg`;
      const imageParams = {
        Bucket: BUCKET_NAME,
        Key: coverImageKey,
        Body: coverImage.buffer,
        ContentType: 'image/jpeg',
      };
      const imageData = await s3.upload(imageParams).promise();
      coverImageUrl = imageData.Location;
    }

    res.json({
      audioUrl: audioData.Location,
      audioKey,
      coverImageUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: `Failed to upload: ${error.message}` });
  }
});

// Generate signed URL for playback
app.post('/presigned-url', async (req, res) => {
  try {
    const { bucket, key, operation, expiresIn = 3600 } = req.body;
    if (!bucket || !key || !operation) {
      return res.status(400).json({ error: 'Missing bucket, key, or operation' });
    }

    const params = {
      Bucket: bucket,
      Key: key,
      Expires: parseInt(expiresIn),
    };
    const url = await s3.getSignedUrlPromise(operation, params);
    res.json({ url });
  } catch (error) {
    console.error('Presigned URL error:', error);
    res.status(500).json({ error: `Failed to generate presigned URL: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});