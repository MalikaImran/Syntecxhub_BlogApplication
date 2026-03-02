const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: { type: String, default: '' },

    // ── Image fields ─────────────────────────────
    featuredImage:         { type: String, default: '' },
    featuredImagePublicId: { type: String, default: '' },

    // ── Video fields ─────────────────────────────
    featuredVideo:         { type: String, default: '' },
    featuredVideoPublicId: { type: String, default: '' },
    mediaType: {
      type: String,
      enum: ['none', 'image', 'video'],
      default: 'none',
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business', 'Other'],
    },
    tags:   [{ type: String, trim: true }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    likes:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views:      { type: Number, default: 0 },          // 📊 NEW
    isFeatured: { type: Boolean, default: false },      // ⭐ NEW
    readTime: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Auto read time + excerpt
blogSchema.pre('save', function (next) {
  const wordsPerMinute = 200;
  const plainText = this.content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  this.readTime = Math.ceil(wordCount / wordsPerMinute) || 1;
  if (!this.excerpt || this.isModified('content')) {
    this.excerpt = plainText.substring(0, 150).trim() + '...';
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);