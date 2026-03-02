import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import toast from 'react-hot-toast';

export default function SingleBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/blogs/${id}`)
      .then(({ data }) => {
        setBlog(data);
        setLikeCount(data.likes?.length || 0);
        if (user) setLiked(data.likes?.includes(user._id));
        setLoading(false);
      })
      .catch(() => { toast.error('Blog not found'); navigate('/'); });
  }, [id]);

  const handleLike = async () => {
    if (!user) return toast.error('Please login to like this blog');
    try {
      const { data } = await API.put(`/blogs/${id}/like`);
      setLiked(data.liked);
      setLikeCount(data.likes);
    } catch { toast.error('Something went wrong'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog permanently?')) return;
    try {
      await API.delete(`/blogs/${id}`);
      toast.success('Blog deleted successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('🔗 Link copied to clipboard!');
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '5rem', color: '#aaa', fontSize: '1.1rem' }}>
      Loading blog...
    </div>
  );

  const isOwner = user && (user._id === blog.author?._id || user.role === 'admin');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 2rem' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: '#aaa' }}>
        <Link to="/" style={{ color: '#3498db' }}>Home</Link>
        <span> / </span>
        <span>{blog.category}</span>
        <span> / </span>
        <span>{blog.title.substring(0, 30)}...</span>
      </div>

      {/* Category Badge */}
      <span style={{
        display: 'inline-block', background: '#e8f4fd', color: '#2980b9',
        padding: '0.3rem 0.9rem', borderRadius: '20px',
        fontSize: '0.82rem', fontWeight: '700', marginBottom: '1rem'
      }}>
        {blog.category}
      </span>

      {/* Title */}
      <h1 style={{
        fontSize: '2.4rem', fontWeight: '900', lineHeight: '1.3',
        color: '#1a1a2e', margin: '0.8rem 0 1.2rem'
      }}>
        {blog.title}
      </h1>

      {/* Author & Meta */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
        marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f0f0f0'
      }}>
        {blog.author?.avatar ? (
          <img src={blog.author.avatar} alt="" style={{
            width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover'
          }} />
        ) : (
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: '#3498db', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '1.1rem'
          }}>
            {blog.author?.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <div style={{ fontWeight: '700', color: '#2c3e50' }}>{blog.author?.name}</div>
          <div style={{ fontSize: '0.82rem', color: '#aaa' }}>
            {new Date(blog.createdAt).toLocaleDateString('en-PK', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', color: '#aaa', fontSize: '0.85rem' }}>
          <span>⏱ {blog.readTime} min read</span>
          <span>❤️ {likeCount} likes</span>
        </div>
      </div>

      {/* Featured Media — image or video */}
      {blog.mediaType === 'video' && blog.featuredVideo ? (
        <video
          src={blog.featuredVideo}
          controls
          style={{
            width: '100%', maxHeight: '500px', borderRadius: '14px',
            marginBottom: '2.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            background: '#000'
          }}
        />
      ) : blog.featuredImage ? (
        <img src={blog.featuredImage} alt={blog.title} style={{
          width: '100%', maxHeight: '480px', objectFit: 'cover',
          borderRadius: '14px', marginBottom: '2.5rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }} />
      ) : null}

      {/* Content */}
      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: blog.content }}
        style={{ lineHeight: '1.9', fontSize: '1.08rem', color: '#333' }}
      />

      {/* Tags */}
      {blog.tags?.length > 0 && (
        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {blog.tags.map((tag) => (
            <span key={tag} style={{
              background: '#f0f7ff', color: '#3498db', padding: '0.3rem 0.9rem',
              borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600'
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap',
        paddingTop: '1.5rem', borderTop: '1px solid #f0f0f0'
      }}>
        <button onClick={handleLike} style={{
          padding: '0.7rem 1.5rem',
          background: liked ? '#e74c3c' : 'white',
          color: liked ? 'white' : '#e74c3c',
          border: '2px solid #e74c3c', borderRadius: '8px',
          cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem',
          transition: 'all 0.2s'
        }}>
          {liked ? '❤️' : '🤍'} {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
        </button>

        <button onClick={handleShare} style={{
          padding: '0.7rem 1.5rem', background: 'white', color: '#2c3e50',
          border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer',
          fontWeight: '700', fontSize: '0.95rem'
        }}>
          🔗 Share
        </button>

        {isOwner && (
          <>
            <Link to={`/edit/${id}`} style={{
              padding: '0.7rem 1.5rem', background: '#3498db', color: 'white',
              borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem'
            }}>
              ✏️ Edit
            </Link>
            <button onClick={handleDelete} style={{
              padding: '0.7rem 1.5rem', background: '#e74c3c', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontWeight: '700', fontSize: '0.95rem'
            }}>
              🗑 Delete
            </button>
          </>
        )}
      </div>

      {/* Comments */}
      <CommentSection blogId={id} />
    </div>
  );
}