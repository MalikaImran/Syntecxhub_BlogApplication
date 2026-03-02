import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import Editor from '../components/Editor';
import toast from 'react-hot-toast';

const CATEGORIES = ['Technology','Lifestyle','Travel','Food','Health','Business','Other'];
const MAX_IMAGE   = 20  * 1024 * 1024;
const MAX_VIDEO   = 200 * 1024 * 1024;
const ALLOWED_IMAGE = ['image/jpeg','image/jpg','image/png','image/webp','image/gif'];
const ALLOWED_VIDEO = ['video/mp4','video/quicktime','video/x-msvideo','video/x-matroska','video/webm'];

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm]         = useState({ title:'', category:'', tags:'' });
  const [content, setContent]   = useState('');
  const [media, setMedia]       = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [preview, setPreview]   = useState('');
  const [existingMedia, setExistingMedia] = useState({ url:'', type:'' });
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    API.get(`/blogs/${id}`)
      .then(({ data }) => {
        setForm({ title:data.title, category:data.category, tags:data.tags?.join(', ')||'' });
        setContent(data.content);
        if (data.mediaType === 'video' && data.featuredVideo) {
          setExistingMedia({ url: data.featuredVideo, type: 'video' });
        } else if (data.featuredImage) {
          setExistingMedia({ url: data.featuredImage, type: 'image' });
        }
        setFetching(false);
      })
      .catch(() => { toast.error('Blog not found'); navigate('/dashboard'); });
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMedia = e => {
    const file = e.target.files[0];
    if (!file) return;
    const isImage = ALLOWED_IMAGE.includes(file.type);
    const isVideo = ALLOWED_VIDEO.includes(file.type);
    if (!isImage && !isVideo) return toast.error('Only images or videos allowed');
    if (isImage && file.size > MAX_IMAGE) return toast.error('Image must be under 20MB');
    if (isVideo && file.size > MAX_VIDEO) return toast.error('Video must be under 200MB');
    setMedia(file);
    setMediaType(isVideo ? 'video' : 'image');
    setPreview(URL.createObjectURL(file));
  };

  const removeNewMedia = () => { setMedia(null); setMediaType(''); setPreview(''); };

  const handleSubmit = async (status) => {
    setLoading(true);
    const toastId = toast.loading(
      media && mediaType === 'video' ? '🎥 Uploading video...' : '⏳ Saving...'
    );
    try {
      const fd = new FormData();
      fd.append('title',    form.title);
      fd.append('content',  content);
      fd.append('category', form.category);
      fd.append('tags',     JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      fd.append('status',   status);
      if (media) fd.append('featuredMedia', media);

      await API.put(`/blogs/${id}`, fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      toast.dismiss(toastId);
      toast.success('Blog updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  const inputStyle = {
    width:'100%', padding:'0.8rem 1rem', border:'1.5px solid #e0e0e0',
    borderRadius:'8px', fontSize:'1rem', outline:'none',
    boxSizing:'border-box', marginBottom:'1rem', fontFamily:'inherit',
  };

  if (fetching) return (
    <div style={{ textAlign:'center', padding:'5rem', color:'#aaa' }}>Loading blog...</div>
  );

  return (
    <div style={{ maxWidth:'850px', margin:'0 auto', padding:'2.5rem 2rem' }}>
      <h2 style={{ fontSize:'1.8rem', fontWeight:'800', color:'#0B1F3A', marginBottom:'2rem' }}>
        ✏️ Edit Blog
      </h2>

      <div style={{ background:'white', padding:'2rem', borderRadius:'14px', boxShadow:'0 2px 10px rgba(11,31,58,0.08)' }}>
        <label style={{ display:'block', fontWeight:'700', marginBottom:'0.4rem', color:'#546E7A' }}>Title *</label>
        <input name="title" value={form.title} onChange={handleChange}
          style={{ ...inputStyle, fontSize:'1.1rem' }} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
          <div>
            <label style={{ display:'block', fontWeight:'700', marginBottom:'0.4rem', color:'#546E7A' }}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange}
              style={{ ...inputStyle, marginBottom:0, background:'white' }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontWeight:'700', marginBottom:'0.4rem', color:'#546E7A' }}>Tags</label>
            <input name="tags" value={form.tags} onChange={handleChange}
              placeholder="react, javascript" style={{ ...inputStyle, marginBottom:0 }} />
          </div>
        </div>

        {/* Current media */}
        {existingMedia.url && !preview && (
          <div style={{ marginBottom:'1rem' }}>
            <label style={{ display:'block', fontWeight:'700', marginBottom:'0.5rem', color:'#546E7A' }}>
              Current {existingMedia.type === 'video' ? 'Video' : 'Image'}
            </label>
            {existingMedia.type === 'video' ? (
              <video src={existingMedia.url} controls style={{
                width:'100%', maxHeight:'220px', borderRadius:'10px', border:'1px solid #e0e0e0'
              }} />
            ) : (
              <img src={existingMedia.url} alt="current" style={{
                width:'100%', maxHeight:'200px', objectFit:'cover',
                borderRadius:'10px', border:'1px solid #e0e0e0'
              }} />
            )}
          </div>
        )}

        {/* New media upload */}
        <label style={{ display:'block', fontWeight:'700', marginBottom:'0.4rem', color:'#546E7A' }}>
          {existingMedia.url ? 'Replace Media (optional)' : 'Add Image or Video (optional)'}
        </label>
        <div style={{
          border:'2px dashed #90CAF9', borderRadius:'12px', padding:'1.25rem',
          marginBottom:'1rem', background:'#F0F8FF', textAlign:'center'
        }}>
          {!preview ? (
            <>
              <p style={{ color:'#90CAF9', fontSize:'0.78rem', marginBottom:'0.75rem' }}>
                🖼 Images: JPG, PNG, WEBP (max 20MB) &nbsp;|&nbsp; 🎥 Videos: MP4, MOV, AVI (max 200MB)
              </p>
              <input type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm"
                onChange={handleMedia} style={{ display:'none' }} id="mediaInputEdit" />
              <label htmlFor="mediaInputEdit" style={{
                padding:'0.5rem 1.25rem', background:'#1565C0', color:'white',
                borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize:'0.85rem'
              }}>
                Choose File
              </label>
            </>
          ) : (
            <div>
              {mediaType === 'video' ? (
                <video src={preview} controls style={{ maxWidth:'100%', maxHeight:'220px', borderRadius:'10px', marginBottom:'0.5rem' }} />
              ) : (
                <img src={preview} alt="new" style={{ maxWidth:'100%', maxHeight:'180px', objectFit:'cover', borderRadius:'10px', marginBottom:'0.5rem' }} />
              )}
              <div style={{ display:'flex', justifyContent:'center', gap:'0.75rem', alignItems:'center' }}>
                <span style={{ fontSize:'0.8rem', color:'#2ecc71', fontWeight:'700' }}>
                  ✓ New {mediaType} selected: {media?.name}
                </span>
                <button onClick={removeNewMedia} style={{
                  background:'#FFEBEE', border:'none', color:'#C62828',
                  padding:'0.25rem 0.7rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.78rem'
                }}>✕ Remove</button>
              </div>
            </div>
          )}
        </div>

        <label style={{ display:'block', fontWeight:'700', marginBottom:'0.4rem', color:'#546E7A' }}>Content *</label>
        <Editor value={content} onChange={setContent} />

        <div style={{ display:'flex', gap:'1rem', marginTop:'1rem' }}>
          <button onClick={() => handleSubmit('draft')} disabled={loading}
            style={{ flex:1, padding:'0.85rem', border:'2px solid #f39c12',
              background:'white', color:'#f39c12', borderRadius:'8px',
              cursor:'pointer', fontWeight:'700', fontSize:'1rem' }}>
            📁 Save as Draft
          </button>
          <button onClick={() => handleSubmit('published')} disabled={loading}
            style={{ flex:1, padding:'0.85rem',
              background: loading ? '#aaa' : 'linear-gradient(135deg,#1565C0,#42A5F5)',
              color:'white', border:'none', borderRadius:'8px',
              cursor: loading ? 'not-allowed' : 'pointer', fontWeight:'700', fontSize:'1rem' }}>
            {loading ? 'Saving...' : '✅ Update & Publish'}
          </button>
        </div>
        <button onClick={() => navigate('/dashboard')}
          style={{ width:'100%', marginTop:'0.75rem', padding:'0.7rem', background:'#f8f9fa',
            border:'1px solid #e0e0e0', borderRadius:'8px', cursor:'pointer', color:'#666' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}