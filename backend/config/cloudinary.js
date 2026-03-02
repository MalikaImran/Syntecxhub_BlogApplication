const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Image storage (blog featured image / avatar) ──────────────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mern-blog/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, height: 630, crop: 'limit' }],
    resource_type: 'image',
  },
});

// ── Video storage ─────────────────────────────────────────────
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mern-blog/videos',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    resource_type: 'video',
  },
});

// ── Multer: image upload (20 MB max) ─────────────────────────
const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP, GIF images are allowed'), false);
    }
  },
});

// ── Multer: video upload (200 MB max) ────────────────────────
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only MP4, MOV, AVI, MKV, WEBM videos are allowed'), false);
    }
  },
});

// ── Multer: both image + video in one request ─────────────────
const memoryStorage = multer.memoryStorage();

const uploadAny = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedVideos = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
    if ([...allowedImages, ...allowedVideos].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPG/PNG/WEBP) and videos (MP4/MOV/AVI/MKV/WEBM) are allowed'), false);
    }
  },
});

module.exports = { cloudinary, upload, uploadVideo, uploadAny };