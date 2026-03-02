import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CommentSection({ blogId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    API.get(`/comments/${blogId}`).then(({ data }) => setComments(data));
  }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!user) return toast.error('Please login to comment');

    setLoading(true);
    try {
      const { data } = await API.post(`/comments/${blogId}`, { text });
      setComments([data, ...comments]);
      setText('');
      toast.success('Comment added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    }
    setLoading(false);
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #f0f0f0' }}>
      <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: '#2c3e50' }}>
        💬 Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
            {user.avatar && (
              <img src={user.avatar} alt="" style={{
                width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0
              }} />
            )}
            <div style={{ flex: 1 }}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                style={{
                  width: '100%', padding: '0.75rem', border: '1px solid #ddd',
                  borderRadius: '10px', fontSize: '0.95rem', resize: 'vertical',
                  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
                }}
              />
              <button type="submit" disabled={loading || !text.trim()} style={{
                marginTop: '0.5rem', padding: '0.55rem 1.5rem',
                background: loading || !text.trim() ? '#aaa' : '#3498db',
                color: 'white', border: 'none', borderRadius: '8px',
                cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
                fontWeight: '600', fontSize: '0.9rem'
              }}>
                {loading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{
          background: '#f8f9fa', padding: '1rem', borderRadius: '10px',
          marginBottom: '1.5rem', textAlign: 'center', color: '#666'
        }}>
          <a href="/login" style={{ color: '#3498db', fontWeight: '600' }}>Login</a> to leave a comment
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <p style={{ color: '#aaa', textAlign: 'center', padding: '2rem' }}>
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {comments.map((c) => (
            <div key={c._id} style={{
              padding: '1rem 1.25rem', border: '1px solid #f0f0f0',
              borderRadius: '10px', background: '#fafafa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {c.author?.avatar && (
                    <img src={c.author.avatar} alt="" style={{
                      width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover'
                    }} />
                  )}
                  <strong style={{ fontSize: '0.9rem', color: '#2c3e50' }}>{c.author?.name}</strong>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#bbb' }}>
                  {new Date(c.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <p style={{ color: '#444', lineHeight: '1.6', margin: '0 0 0.5rem' }}>{c.text}</p>
              {user && (user._id === c.author?._id || user.role === 'admin') && (
                <button onClick={() => handleDelete(c._id)} style={{
                  background: 'none', border: 'none', color: '#e74c3c',
                  cursor: 'pointer', fontSize: '0.8rem', padding: 0
                }}>
                  🗑 Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
