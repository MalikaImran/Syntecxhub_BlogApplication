const User    = require('../models/User');
const Blog    = require('../models/Blog');
const Comment = require('../models/Comment');
const { cloudinary } = require('../config/cloudinary');

// @PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.name) user.name = req.body.name;
    if (req.file) {
      if (user.avatarPublicId) await cloudinary.uploader.destroy(user.avatarPublicId);
      user.avatar = req.file.path;
      user.avatarPublicId = req.file.filename;
    }
    await user.save();
    res.json({ _id:user._id, name:user.name, email:user.email, avatar:user.avatar, role:user.role });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @GET /api/users/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @DELETE /api/users/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete an admin' });
    await Blog.deleteMany({ author: req.params.id });
    await Comment.deleteMany({ author: req.params.id });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @PUT /api/users/admin/users/:id/promote
exports.promoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();
    res.json({ message: `User is now ${user.role}`, role: user.role });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @PUT /api/users/admin/users/:id/ban   ← NEW
exports.banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot ban an admin' });
    user.isBanned  = !user.isBanned;
    user.banReason = user.isBanned ? (req.body.reason || 'Violation of terms') : '';
    await user.save();
    res.json({ message: user.isBanned ? 'User banned' : 'User unbanned', isBanned: user.isBanned });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @GET /api/users/admin/stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers     = await User.countDocuments();
    const bannedUsers    = await User.countDocuments({ isBanned: true });
    const totalBlogs     = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: 'published' });
    const draftBlogs     = await Blog.countDocuments({ status: 'draft' });
    const totalComments  = await Comment.countDocuments();
    const viewsAgg = await Blog.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
    const totalViews = viewsAgg[0]?.total || 0;

    // Category breakdown  ← NEW
    const categoryStats = await Blog.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort:  { count: -1 } }
    ]);

    res.json({ totalUsers, bannedUsers, totalBlogs, publishedBlogs, draftBlogs, totalComments, totalViews, categoryStats });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @GET /api/users/admin/blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'name email').sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @DELETE /api/users/admin/blogs/:id
exports.adminDeleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ message: 'Blog deleted by admin' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @GET /api/users/admin/comments   ← NEW
exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('author', 'name avatar')
      .populate('blog', 'title')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(comments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @DELETE /api/users/admin/comments/:id   ← NEW
exports.adminDeleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.json({ message: 'Comment deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ⭐ @PUT /api/users/admin/blogs/:id/feature
exports.toggleFeature = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    blog.isFeatured = !blog.isFeatured;
    await blog.save();
    res.json({ message: blog.isFeatured ? 'Blog featured!' : 'Blog unfeatured', isFeatured: blog.isFeatured });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// 🗑 @DELETE /api/users/admin/blogs/bulk
exports.bulkDeleteBlogs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ message: 'No IDs provided' });
    await Blog.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} blogs deleted` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// 🗑 @DELETE /api/users/admin/users/bulk
exports.bulkDeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ message: 'No IDs provided' });
    // Don't delete admins
    const nonAdmins = await User.find({ _id: { $in: ids }, role: { $ne: 'admin' } });
    const safeIds = nonAdmins.map(u => u._id);
    await Blog.deleteMany({ author: { $in: safeIds } });
    await User.deleteMany({ _id: { $in: safeIds } });
    res.json({ message: `${safeIds.length} users deleted` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};