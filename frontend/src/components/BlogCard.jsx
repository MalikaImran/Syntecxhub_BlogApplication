import { Link } from 'react-router-dom';

const categoryColors = {
  Technology: '#3498db',
  Lifestyle: '#e67e22',
  Travel: '#27ae60',
  Food: '#e74c3c',
  Health: '#9b59b6',
  Business: '#2c3e50',
  Other: '#95a5a6',
};

export default function BlogCard({ blog }) {
  const color = categoryColors[blog.category] || '#3498db';

  return (
    <div style={{
      border: '1px solid #e8e8e8', borderRadius: '14px', overflow: 'hidden',
      background: 'white', transition: 'all 0.25s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
    >
      {/* Featured Image */}
      {blog.featuredImage ? (
        <img src={blog.featuredImage} alt={blog.title} style={{
          width: '100%', height: '200px', objectFit: 'cover'
        }} />
      ) : (
        <div style={{
          width: '100%', height: '200px', background: `linear-gradient(135deg, ${color}22, ${color}44)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem'
        }}>
          📝
        </div>
      )}

      <div style={{ padding: '1.25rem' }}>
        {/* Category */}
        <span style={{
          display: 'inline-block', background: `${color}18`, color: color,
          padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem',
          fontWeight: '700', letterSpacing: '0.5px', marginBottom: '0.7rem'
        }}>
          {blog.category}
        </span>

        {/* Title */}
        <h3 style={{ fontSize: '1.05rem', lineHeight: '1.5', marginBottom: '0.5rem', fontWeight: '700' }}>
          <Link to={`/blog/${blog._id}`} style={{ color: '#1a1a2e' }}
            onMouseEnter={e => e.target.style.color = color}
            onMouseLeave={e => e.target.style.color = '#1a1a2e'}>
            {blog.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p style={{ color: '#777', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1rem' }}>
          {blog.excerpt?.substring(0, 120)}...
        </p>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '0.78rem', color: '#aaa', borderTop: '1px solid #f0f0f0', paddingTop: '0.8rem'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {blog.author?.avatar && (
              <img src={blog.author.avatar} alt="" style={{
                width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover'
              }} />
            )}
            {blog.author?.name}
          </span>
          <span>⏱ {blog.readTime} min</span>
          <span>{new Date(blog.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>

        {/* Likes */}
        {blog.likes?.length > 0 && (
          <div style={{ fontSize: '0.78rem', color: '#e74c3c', marginTop: '0.5rem' }}>
            ❤️ {blog.likes.length} {blog.likes.length === 1 ? 'like' : 'likes'}
          </div>
        )}
      </div>
    </div>
  );
}
