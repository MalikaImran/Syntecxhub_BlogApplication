const Blog = require('../models/Blog');
const { cloudinary } = require('../config/cloudinary');

// Helper: upload file to cloudinary based on type
const uploadToCloudinary = async (file) => {
  const isVideo = file.mimetype.startsWith('video/');
  const folder  = isVideo ? 'mern-blog/videos' : 'mern-blog/images';

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isVideo ? 'video' : 'image',
        ...(isVideo ? {} : { transformation: [{ width: 1200, height: 630, crop: 'limit' }] }),
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const fs = require('fs');
    if (file.path) {
      // Disk storage — file.path exists
      const fileStream = fs.createReadStream(file.path);
      fileStream.pipe(stream);
      fileStream.on('end', () => {
        // Cleanup temp file
        fs.unlink(file.path, () => {});
      });
    } else if (file.buffer) {
      // Memory storage — file.buffer exists
      stream.end(file.buffer);
    } else {
      reject(new Error('No file data found'));
    }
  });
};

// @GET /api/blogs
exports.getBlogs = async (req, res) => {
  try {
    const { search, category, author, sort } = req.query;
    const filter = { status: 'published' };
    if (search)   filter.title  = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (author)   filter.author   = author;
    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const blogs = await Blog.find(filter).sort(sortOption).populate('author', 'name avatar');
    res.json(blogs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @GET /api/blogs/my
exports.getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @GET /api/blogs/:id
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name avatar email');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @POST /api/blogs
exports.createBlog = async (req, res) => {
  try {
    console.log('📝 Body:', req.body);
    console.log('📎 File:', req.file ? `${req.file.originalname} (${req.file.mimetype})` : 'none');

    const { title, content, category, tags, status } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Title, content and category are required' });
    }

    const blogStatus = (status && status.trim() === 'published') ? 'published' : 'draft';
    let parsedTags = [];
    if (tags) { try { parsedTags = JSON.parse(tags); } catch { parsedTags = []; } }

    const blogData = {
      title: title.trim(),
      content,
      category,
      author: req.user._id,
      tags: parsedTags,
      status: blogStatus,
      mediaType: 'none',
    };

    // Handle file upload
    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');

      if (isVideo) {
        // Video: upload directly to cloudinary with resource_type: video
        console.log('🎥 Uploading video to Cloudinary...');
        const result = await uploadToCloudinary(req.file);
        blogData.featuredVideo         = result.secure_url;
        blogData.featuredVideoPublicId = result.public_id;
        blogData.mediaType             = 'video';
        console.log('✅ Video uploaded:', result.secure_url);
      } else {
        // Image: already handled by CloudinaryStorage middleware
        blogData.featuredImage         = req.file.path || req.file.secure_url;
        blogData.featuredImagePublicId = req.file.filename || req.file.public_id;
        blogData.mediaType             = 'image';
        console.log('✅ Image uploaded:', blogData.featuredImage);
      }
    }

    const blog = await Blog.create(blogData);
    await blog.populate('author', 'name avatar');
    console.log('✅ Blog saved. Status:', blog.status, '| MediaType:', blog.mediaType);
    res.status(201).json(blog);
  } catch (err) {
    console.error('❌ Create error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/blogs/:id
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, category, tags, status } = req.body;
    if (title)   { blog.title = title.trim(); }
    if (content) {
      blog.content = content;
      const plainText = content.replace(/<[^>]*>/g, '');
      blog.excerpt = plainText.substring(0, 150).trim() + '...';
    }
    if (category) blog.category = category;
    if (tags)   { try { blog.tags = JSON.parse(tags); } catch { blog.tags = []; } }
    if (status) { blog.status = status.trim(); }

    // Handle new file upload
    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');

      // Delete old media from cloudinary
      if (blog.featuredImagePublicId) {
        await cloudinary.uploader.destroy(blog.featuredImagePublicId, { resource_type: 'image' });
        blog.featuredImage         = '';
        blog.featuredImagePublicId = '';
      }
      if (blog.featuredVideoPublicId) {
        await cloudinary.uploader.destroy(blog.featuredVideoPublicId, { resource_type: 'video' });
        blog.featuredVideo         = '';
        blog.featuredVideoPublicId = '';
      }

      if (isVideo) {
        const result = await uploadToCloudinary(req.file);
        blog.featuredVideo         = result.secure_url;
        blog.featuredVideoPublicId = result.public_id;
        blog.mediaType             = 'video';
      } else {
        blog.featuredImage         = req.file.path || req.file.secure_url;
        blog.featuredImagePublicId = req.file.filename || req.file.public_id;
        blog.mediaType             = 'image';
      }
    }

    blog.markModified('content');
    blog.markModified('tags');
    const updated = await blog.save();
    await updated.populate('author', 'name avatar');
    res.json(updated);
  } catch (err) {
    console.error('❌ Update error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/blogs/:id
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (blog.featuredImagePublicId) {
      await cloudinary.uploader.destroy(blog.featuredImagePublicId, { resource_type: 'image' });
    }
    if (blog.featuredVideoPublicId) {
      await cloudinary.uploader.destroy(blog.featuredVideoPublicId, { resource_type: 'video' });
    }
    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @PUT /api/blogs/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    const userId    = req.user._id.toString();
    const likeIndex = blog.likes.findIndex(id => id.toString() === userId);
    if (likeIndex === -1) blog.likes.push(req.user._id);
    else blog.likes.splice(likeIndex, 1);
    await blog.save();
    res.json({ likes: blog.likes.length, liked: likeIndex === -1 });
  } catch (err) { res.status(500).json({ message: err.message }); }
};