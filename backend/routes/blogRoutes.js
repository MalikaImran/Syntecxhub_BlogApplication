const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const {
  getBlogs, getBlog, createBlog, updateBlog,
  deleteBlog, getMyBlogs, toggleLike,
} = require('../controllers/blogController');
const { protect }  = require('../middleware/authMiddleware');

// ── Multer: accept image OR video, store in memory so controller
//    can decide which Cloudinary resource_type to use ───────────
const allowedMimes = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm',
];

const mediaUpload = multer({
  storage: multer.diskStorage({
    destination: '/tmp',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB for videos
  fileFilter: (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`), false);
    }
  },
});

router.get('/',          getBlogs);
router.get('/my',        protect, getMyBlogs);
router.get('/:id',       getBlog);
router.post('/',         protect, mediaUpload.single('featuredMedia'), createBlog);
router.put('/:id',       protect, mediaUpload.single('featuredMedia'), updateBlog);
router.delete('/:id',    protect, deleteBlog);
router.put('/:id/like',  protect, toggleLike);

module.exports = router;