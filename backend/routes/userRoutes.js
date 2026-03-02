const express = require('express');
const router  = express.Router();
const c = require('../controllers/userController');
const { protect }   = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { upload }    = require('../config/cloudinary');

router.put('/profile',                    protect, upload.single('avatar'), c.updateProfile);
router.get('/admin/users',                protect, adminOnly, c.getAllUsers);
router.delete('/admin/users/bulk',        protect, adminOnly, c.bulkDeleteUsers);
router.delete('/admin/users/:id',         protect, adminOnly, c.deleteUser);
router.put('/admin/users/:id/promote',    protect, adminOnly, c.promoteUser);
router.put('/admin/users/:id/ban',        protect, adminOnly, c.banUser);
router.get('/admin/stats',                protect, adminOnly, c.getStats);
router.get('/admin/blogs',                protect, adminOnly, c.getAllBlogs);
router.delete('/admin/blogs/bulk',        protect, adminOnly, c.bulkDeleteBlogs);
router.delete('/admin/blogs/:id',         protect, adminOnly, c.adminDeleteBlog);
router.put('/admin/blogs/:id/feature',    protect, adminOnly, c.toggleFeature);
router.get('/admin/comments',             protect, adminOnly, c.getAllComments);
router.delete('/admin/comments/:id',      protect, adminOnly, c.adminDeleteComment);

module.exports = router;