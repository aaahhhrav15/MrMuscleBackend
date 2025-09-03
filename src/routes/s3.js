const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const auth = require('../middleware/auth');

const router = express.Router();
const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_S3_BUCKET;

/**
 * POST /s3/presigned-url
 * Generate a pre-signed URL for uploading files to S3
 */
router.post('/presigned-url', auth, async (req, res) => {
  try {
    const { folder, fileName, fileType } = req.body;

    if (!folder || !fileName || !fileType) {
      return res.status(400).json({ error: 'Folder, fileName, and fileType are required' });
    }

    const key = `${folder}/${fileName}`;
    // Debug log for signature issues
    console.log('[S3 PRESIGN DEBUG]', {
      region: process.env.AWS_REGION,
      bucket: BUCKET_NAME,
      key,
      fileType,
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKeyPresent: !!process.env.AWS_SECRET_ACCESS_KEY
    });
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    res.json({ url, key });
  } catch (e) {
    console.error('[S3 PRESIGNED URL]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
