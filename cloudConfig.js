const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const streamifier = require('streamifier');
const { randomUUID } = require('crypto');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const usesCloudinary = Boolean(cloudName && apiKey && apiSecret && cloudName !== 'your_cloud_name');

if (usesCloudinary) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
} else {
  console.log('[cloudConfig] Cloudinary not configured, using local uploads folder.');
}

const uploadDir = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

function uploadBufferToStorage(buffer, folder = '', filename = '') {
  return new Promise((resolve, reject) => {
    if (usesCloudinary) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename ? `${filename}-${Date.now()}` : undefined,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
      return;
    }

    const ext = path.extname(filename || 'upload').toLowerCase() || '.png';
    const safeName = `${(filename || randomUUID()).replace(/[^a-zA-Z0-9.-]/g, '_')}${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, safeName);

    fs.writeFile(filePath, buffer, (err) => {
      if (err) return reject(err);
      resolve({
        secure_url: `/uploads/${safeName}`,
        public_id: safeName,
      });
    });
  });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

module.exports = { cloudinary, storage, uploadBufferToStorage };
