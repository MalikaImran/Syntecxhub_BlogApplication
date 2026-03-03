const Blog = require('../models/Blog');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');

// ── Upload ANY file (image or video) to Cloudinary ──────────────
const uploadToCloudinary = async (file) => {
  const isVideo  = file.mimetype.startsWith('video/');
  const folder   = isVideo ? 'mern-blog/videos' : 'mern-blog/images';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isVideo ? 'video' : 'image',
        ...(isVideo ? {} : { transformation: [{ width: 1200, height: 630, crop: 'limit' }] }),
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    if (file.path) {
      // Disk storage (/tmp/...) — stream the file then delete it
      const readStream = fs.createReadStream(file.path);
      readStream.pipe(uploadStream);
      readStream.on('error', reject);
      readStream.on('end', () => fs.unlink(file.path, () => {}));
    } else if (file.buffer) {
      // Memory storage — push buffer directly
      uploadStream.end(file.buffer);
    } else {
      reject(new Error('No file data available'));
    }
  });
};

// @GET /api/blogs
exports.getBlogs = async (req, res) => {
  try {
    const { search, category, author, sort } = req.query;
    const filter = { status: 'published' };
    if (search)   filter.title    = { $regex: search, $options: 'i' };
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
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name avatar email');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @POST /api/blogs
exports.createBlog = async (req, res) => {
  try {
    console.log('📝 createBlog body:', req.body);
    console.log('📎 File:', req.file ? `${req.file.originalname} | ${req.file.mimetype} | ${req.file.size} bytes` : 'none');

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

    // ── Upload image OR video to Cloudinary ──────────────────────
    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      console.log(`⏫ Uploading ${isVideo ? 'VIDEO' : 'IMAGE'} to Cloudinary...`);

      const result = await uploadToCloudinary(req.file);   // ← ALWAYS use this helper
      console.log('✅ Cloudinary URL:', result.secure_url);

      if (isVideo) {
        blogData.featuredVideo         = result.secure_url;
        blogData.featuredVideoPublicId = result.public_id;
        blogData.mediaType             = 'video';
      } else {
        blogData.featuredImage         = result.secure_url;   // ← secure_url, NOT req.file.path
        blogData.featuredImagePublicId = result.public_id;
        blogData.mediaType             = 'image';
      }
    }

    const blog = await Blog.create(blogData);
    await blog.populate('author', 'name avatar');
    console.log('✅ Saved | status:', blog.status, '| mediaType:', blog.mediaType, '| image:', blog.featuredImage || 'none');
    res.status(201).json(blog);
  } catch (err) {
    console.error('❌ createBlog error:', err.message);
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
    if (title)    blog.title    = title.trim();
    if (content) {
      blog.content = content;
      const plain = content.replace(/<[^>]*>/g, '');
      blog.excerpt = plain.substring(0, 150).trim() + '...';
    }
    if (category) blog.category = category;
    if (tags)   { try { blog.tags = JSON.parse(tags); } catch { blog.tags = []; } }
    if (status)   blog.status   = status.trim();

    // ── Replace media ────────────────────────────────────────────
    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');

      // Delete old Cloudinary assets
      if (blog.featuredImagePublicId) {
        await cloudinary.uploader.destroy(blog.featuredImagePublicId, { resource_type: 'image' }).catch(() => {});
        blog.featuredImage = ''; blog.featuredImagePublicId = '';
      }
      if (blog.featuredVideoPublicId) {
        await cloudinary.uploader.destroy(blog.featuredVideoPublicId, { resource_type: 'video' }).catch(() => {});
        blog.featuredVideo = ''; blog.featuredVideoPublicId = '';
      }

      const result = await uploadToCloudinary(req.file);  // ← same helper

      if (isVideo) {
        blog.featuredVideo         = result.secure_url;
        blog.featuredVideoPublicId = result.public_id;
        blog.mediaType             = 'video';
      } else {
        blog.featuredImage         = result.secure_url;   // ← secure_url
        blog.featuredImagePublicId = result.public_id;
        blog.mediaType             = 'image';
      }
    }

    blog.markModified('content');
    blog.markModified('tags');
    const updated = await blog.save();
    await updated.populate('author', 'name avatar');
    res.json(updated);
  } catch (err) {
    console.error('❌ updateBlog error:', err.message);
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
    if (blog.featuredImagePublicId)
      await cloudinary.uploader.destroy(blog.featuredImagePublicId, { resource_type: 'image' }).catch(() => {});
    if (blog.featuredVideoPublicId)
      await cloudinary.uploader.destroy(blog.featuredVideoPublicId, { resource_type: 'video' }).catch(() => {});
    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @PUT /api/blogs/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    const uid = req.user._id.toString();
    const idx = blog.likes.findIndex(id => id.toString() === uid);
    if (idx === -1) blog.likes.push(req.user._id);
    else blog.likes.splice(idx, 1);
    await blog.save();
    res.json({ likes: blog.likes.length, liked: idx === -1 });
  } catch (err) { res.status(500).json({ message: err.message }); }
};