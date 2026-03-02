import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Editor from '../components/Editor';
import toast from 'react-hot-toast';

const CATEGORIES = ['Technology','Lifestyle','Travel','Food','Health','Business','Other'];

const MAX_IMAGE = 20  * 1024 * 1024; // 20 MB
const MAX_VIDEO = 200 * 1024 * 1024; // 200 MB

const ALLOWED_IMAGE = ['image/jpeg','image/jpg','image/png','image/webp','image/gif'];
const ALLOWED_VIDEO = ['video/mp4','video/quicktime','video/x-msvideo','video/x-matroska','video/webm'];

export default function CreateBlog() {
  const [form, setForm]       = useState({ title:'', category:'Technology', tags:'' });
  const [content, setContent] = useState('');
  const [media, setMedia]     = useState(null);       // selected file
  const [mediaType, setMediaType] = useState('');     // 'image' | 'video'
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMedia = e => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = ALLOWED_IMAGE.includes(file.mimetype || file.type);
    const isVideo = ALLOWED_VIDEO.includes(file.mimetype || file.type);

    if (!isImage && !isVideo) {
      return toast.error('Only JPG, PNG, WEBP, GIF images or MP4, MOV, AVI, MKV, WEBM videos allowed');
    }
    if (isImage && file.size > MAX_IMAGE) return toast.error('Image must be under 20MB');
    if (isVideo && file.size > MAX_VIDEO) return toast.error('Video must be under 200MB');

    setMedia(file);
    setMediaType(isVideo ? 'video' : 'image');
    setPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => { setMedia(null); setMediaType(''); setPreview(''); };

  const handleSubmit = async (status) => {
    if (!form.title.trim())                  return toast.error('Title is required');
    if (!content || content === '<p><br></p>') return toast.error('Content is required');
    if (!form.category)                      return toast.error('Category is required');

    setLoading(true);
    const toastId = toast.loading(
      media && mediaType === 'video' ? '🎥 Uploading video (this may take a moment)...' : '⏳ Publishing...'
    );

    try {
      const fd = new FormData();
      fd.append('title',    form.title);
      fd.append('content',  content);
      fd.append('category', form.category);
      fd.append('tags',     JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      fd.append('status',   status);
      if (media) fd.append('featuredMedia', media);  // ← single field for both

      await API.post('/blogs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      toast.dismiss(toastId);
      toast.success(status === 'published' ? '🎉 Blog Published!' : '📁 Saved as Draft!');
      navigate('/dashboard');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || 'Failed to create blog');
    }
    setLoading(false);
  };

  const inputStyle = {
    width:'100%', padding:'0.8rem 1rem', border:'1.5px solid #e0e0e0',
    borderRadius:'8px', fontSize:'1rem', outline:'none',
    boxSizing:'border-box', marginBottom:'1rem', fontFamily:'inherit',
  };

  return (
    <div style={{ maxWidth:'850px', margin:'0 auto', padding:'2.5rem 2rem' }}>
      <h2 style={{ fontSize:'1.8rem', fontWeight:'800', color:'#0B1F3A', marginBottom:'2rem' }}>
        ✍️ Write New Blog
      </h2>

      <div style={{ background:'white', padding:'2rem', borderRadius:'14px', boxShadow:'0 2px 10px rgba(11,31,58,0.08)' }}>
        <label style={{ display:'block', fontWeight:'700', marginBottom:'0.4rem', color:'#546E7A' }}>Blog Title *</label>
        <input name="title" placeholder="Enter a compelling title..." value={form.title}
          onChange={handleChange} style={{ ...inputStyle, fontSize:'1.1rem', fontWeight:'600' }} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
          <div>
            <label style={{ display:'block', fontWeight:'700', marginBottom:'0.4rem', color:'#546E7A' }}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange}
              style={{ ...inputStyle, marginBottom:0, background:'white' }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontWeight:'700', marginBottom:'0.4rem', color:'#546E7A' }}>Tags (optional)</label>
            <input name="tags" placeholder="react, javascript, webdev" value={form.tags}
              onChange={handleChange} style={{ ...inputStyle, marginBottom:0 }} />
          </div>
        </div>

        {/* ── Media Upload ─────────────────────────── */}
        <label style={{ display:'block', fontWeight:'700', marginBottom:'0.4rem', color:'#546E7A' }}>
          Featured Image or Video
        </label>
        <div style={{
          border:'2px dashed #90CAF9', borderRadius:'12px', padding:'1.25rem',
          marginBottom:'1rem', background:'#F0F8FF', textAlign:'center'
        }}>
          {!preview ? (
            <>
              <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>📎</div>
              <p style={{ color:'#546E7A', fontSize:'0.88rem', marginBottom:'0.75rem' }}>
                Drag & drop or click to select
              </p>
              <p style={{ color:'#90CAF9', fontSize:'0.78rem', marginBottom:'0.75rem' }}>
                🖼 Images: JPG, PNG, WEBP, GIF (max 20MB) &nbsp;|&nbsp; 🎥 Videos: MP4, MOV, AVI, MKV, WEBM (max 200MB)
              </p>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm"
                onChange={handleMedia}
                style={{ display:'none' }}
                id="mediaInput"
              />
              <label htmlFor="mediaInput" style={{
                padding:'0.55rem 1.5rem', background:'#1565C0', color:'white',
                borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize:'0.88rem'
              }}>
                Choose File
              </label>
            </>
          ) : (
            <div>
              {mediaType === 'video' ? (
                <video src={preview} controls style={{
                  maxWidth:'100%', maxHeight:'280px', borderRadius:'10px', marginBottom:'0.75rem'
                }} />
              ) : (
                <img src={preview} alt="preview" style={{
                  maxWidth:'100%', maxHeight:'220px', objectFit:'cover',
                  borderRadius:'10px', marginBottom:'0.75rem'
                }} />
              )}
              <div style={{ display:'flex', justifyContent:'center', gap:'0.75rem', alignItems:'center' }}>
                <span style={{ fontSize:'0.82rem', color:'#546E7A' }}>
                  {mediaType === 'video' ? '🎥' : '🖼'} {media?.name}
                </span>
                <button onClick={removeMedia} style={{
                  background:'#FFEBEE', border:'none', color:'#C62828',
                  padding:'0.3rem 0.8rem', borderRadius:'6px', cursor:'pointer',
                  fontSize:'0.8rem', fontWeight:'700'
                }}>✕ Remove</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Editor ───────────────────────────────── */}
        <label style={{ display:'block', fontWeight:'700', marginBottom:'0.4rem', color:'#546E7A' }}>Content *</label>
        <Editor value={content} onChange={setContent} />

        <div style={{ display:'flex', gap:'1rem', marginTop:'1rem' }}>
          <button onClick={() => handleSubmit('draft')} disabled={loading}
            style={{
              flex:1, padding:'0.85rem', border:'2px solid #1565C0',
              background:'white', color:'#1565C0', borderRadius:'8px',
              cursor:'pointer', fontWeight:'700', fontSize:'1rem'
            }}>
            📁 Save as Draft
          </button>
          <button onClick={() => handleSubmit('published')} disabled={loading}
            style={{
              flex:1, padding:'0.85rem',
              background: loading ? '#aaa' : 'linear-gradient(135deg,#1565C0,#42A5F5)',
              color:'white', border:'none', borderRadius:'8px',
              cursor: loading ? 'not-allowed' : 'pointer', fontWeight:'700', fontSize:'1rem',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(21,101,192,0.35)'
            }}>
            {loading ? 'Publishing...' : '🚀 Publish Blog'}
          </button>
        </div>
      </div>
    </div>
  );
}