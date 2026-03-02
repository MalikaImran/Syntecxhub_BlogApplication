import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const T = {
  navy:    '#0B1F3A',
  navyMid: '#112D4E',
  navyLt:  '#1A3D5C',
  blue:    '#1565C0',
  blueMid: '#1976D2',
  sky:     '#42A5F5',
  skyLt:   '#90CAF9',
  ice:     '#E3F2FD',
  icePale: '#F0F8FF',
  white:   '#FFFFFF',
  slate:   '#546E7A',
  green:   '#00C897',
  amber:   '#FFB300',
  red:     '#FF5252',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

  .dash-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .dash-root { font-family: 'DM Sans', sans-serif; background: ${T.icePale}; min-height: 100vh; }

  /* Sidebar */
  .sidebar {
    position: fixed; top: 0; left: 0; height: 100vh; width: 260px;
    background: linear-gradient(180deg, ${T.navy} 0%, ${T.navyMid} 60%, ${T.navyLt} 100%);
    display: flex; flex-direction: column; z-index: 100;
    box-shadow: 4px 0 24px rgba(11,31,58,0.18);
  }
  .sidebar-logo {
    padding: 2rem 1.75rem 1.5rem;
    border-bottom: 1px solid rgba(144,202,249,0.12);
  }
  .sidebar-logo h1 {
    font-family: 'Sora', sans-serif; font-size: 1.35rem; font-weight: 800;
    color: ${T.white}; letter-spacing: -0.5px;
  }
  .sidebar-logo span { color: ${T.sky}; }
  .sidebar-logo p { font-size: 0.72rem; color: ${T.skyLt}; opacity: 0.7; margin-top: 2px; letter-spacing: 1px; text-transform: uppercase; }

  .nav-section { padding: 1.25rem 1rem; flex: 1; }
  .nav-label { font-size: 0.65rem; font-weight: 700; color: ${T.skyLt}; opacity: 0.5;
    letter-spacing: 2px; text-transform: uppercase; padding: 0 0.75rem; margin-bottom: 0.5rem; margin-top: 1rem; }
  .nav-item {
    display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 0.75rem;
    border-radius: 10px; cursor: pointer; transition: all 0.2s; margin-bottom: 2px;
    color: rgba(144,202,249,0.7); font-size: 0.88rem; font-weight: 500; text-decoration: none;
  }
  .nav-item:hover { background: rgba(66,165,245,0.12); color: ${T.skyLt}; }
  .nav-item.active { background: linear-gradient(90deg, rgba(21,101,192,0.6), rgba(66,165,245,0.2));
    color: ${T.white}; box-shadow: inset 3px 0 0 ${T.sky}; }
  .nav-item .icon { font-size: 1.1rem; width: 22px; text-align: center; }
  .nav-badge { margin-left: auto; background: ${T.sky}; color: ${T.navy};
    font-size: 0.65rem; font-weight: 800; padding: 1px 7px; border-radius: 20px; }

  .sidebar-footer {
    padding: 1.25rem; border-top: 1px solid rgba(144,202,249,0.1);
  }
  .user-card {
    display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem;
    background: rgba(255,255,255,0.05); border-radius: 12px; cursor: pointer;
    transition: background 0.2s;
  }
  .user-card:hover { background: rgba(255,255,255,0.09); }
  .user-avatar {
    width: 38px; height: 38px; border-radius: 10px; object-fit: cover;
    background: linear-gradient(135deg, ${T.blue}, ${T.sky});
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 800; font-size: 1rem; flex-shrink: 0;
  }
  .user-name { font-size: 0.85rem; font-weight: 600; color: ${T.white}; }
  .user-role { font-size: 0.7rem; color: ${T.skyLt}; opacity: 0.6; }

  /* Main content */
  .main { margin-left: 260px; padding: 2rem 2.5rem; min-height: 100vh; }

  /* Topbar */
  .topbar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 2.5rem;
  }
  .topbar-left h2 {
    font-family: 'Sora', sans-serif; font-size: 1.7rem; font-weight: 800;
    color: ${T.navy}; letter-spacing: -0.5px;
  }
  .topbar-left p { color: ${T.slate}; font-size: 0.88rem; margin-top: 2px; }
  .topbar-actions { display: flex; gap: 0.75rem; align-items: center; }
  .btn-primary {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.65rem 1.4rem; background: linear-gradient(135deg, ${T.blue}, ${T.sky});
    color: white; border: none; border-radius: 10px; font-size: 0.88rem;
    font-weight: 700; cursor: pointer; transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(21,101,192,0.35); font-family: 'DM Sans', sans-serif;
    text-decoration: none;
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(21,101,192,0.45); }
  .btn-ghost {
    padding: 0.65rem 1.1rem; background: white; color: ${T.navyMid};
    border: 1.5px solid ${T.ice}; border-radius: 10px; font-size: 0.88rem;
    font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .btn-ghost:hover { border-color: ${T.sky}; color: ${T.blue}; background: ${T.ice}; }

  /* Stats grid */
  .stats-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem;
    margin-bottom: 2rem;
  }
  .stat-card {
    background: white; border-radius: 16px; padding: 1.5rem;
    box-shadow: 0 2px 12px rgba(11,31,58,0.06); position: relative; overflow: hidden;
    border: 1px solid rgba(144,202,249,0.2); transition: transform 0.2s, box-shadow 0.2s;
  }
  .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(11,31,58,0.1); }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  }
  .stat-card.blue::before { background: linear-gradient(90deg, ${T.blue}, ${T.sky}); }
  .stat-card.green::before { background: linear-gradient(90deg, #00897B, ${T.green}); }
  .stat-card.amber::before { background: linear-gradient(90deg, #F57C00, ${T.amber}); }
  .stat-card.red::before { background: linear-gradient(90deg, #C62828, ${T.red}); }

  .stat-icon {
    width: 44px; height: 44px; border-radius: 12px; display: flex;
    align-items: center; justify-content: center; font-size: 1.2rem; margin-bottom: 1rem;
  }
  .stat-card.blue .stat-icon { background: ${T.ice}; }
  .stat-card.green .stat-icon { background: #E0F7EF; }
  .stat-card.amber .stat-icon { background: #FFF8E1; }
  .stat-card.red .stat-icon { background: #FFEBEE; }

  .stat-value {
    font-family: 'Sora', sans-serif; font-size: 2rem; font-weight: 800;
    color: ${T.navy}; line-height: 1;
  }
  .stat-label { font-size: 0.8rem; color: ${T.slate}; margin-top: 4px; font-weight: 500; }
  .stat-change { font-size: 0.75rem; margin-top: 0.6rem; font-weight: 600; }
  .stat-change.up { color: ${T.green}; }
  .stat-change.neutral { color: ${T.slate}; }

  /* Blog list */
  .content-grid { display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; }

  .blogs-panel {
    background: white; border-radius: 18px;
    box-shadow: 0 2px 12px rgba(11,31,58,0.06); border: 1px solid rgba(144,202,249,0.2);
    overflow: hidden;
  }
  .panel-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 1.35rem 1.75rem; border-bottom: 1px solid ${T.ice};
  }
  .panel-title {
    font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; color: ${T.navy};
  }
  .filter-tabs { display: flex; gap: 0.35rem; }
  .filter-tab {
    padding: 0.3rem 0.8rem; border-radius: 8px; font-size: 0.78rem; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.18s; font-family: 'DM Sans', sans-serif;
  }
  .filter-tab.active { background: ${T.navy}; color: white; }
  .filter-tab:not(.active) { background: ${T.ice}; color: ${T.slate}; }
  .filter-tab:not(.active):hover { background: ${T.skyLt}; color: ${T.navy}; }

  .blog-row {
    display: flex; align-items: center; gap: 1rem; padding: 1rem 1.75rem;
    border-bottom: 1px solid ${T.icePale}; transition: background 0.15s;
  }
  .blog-row:last-child { border-bottom: none; }
  .blog-row:hover { background: ${T.icePale}; }

  .blog-thumb {
    width: 52px; height: 52px; border-radius: 10px; object-fit: cover;
    background: linear-gradient(135deg, ${T.ice}, ${T.skyLt});
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; flex-shrink: 0;
  }
  .blog-info { flex: 1; min-width: 0; }
  .blog-title {
    font-size: 0.9rem; font-weight: 600; color: ${T.navy};
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .blog-meta { display: flex; gap: 0.75rem; margin-top: 3px; align-items: center; }
  .blog-cat {
    font-size: 0.7rem; font-weight: 700; padding: 1px 8px; border-radius: 6px;
    background: ${T.ice}; color: ${T.blue};
  }
  .blog-date { font-size: 0.72rem; color: ${T.slate}; }
  .blog-likes { font-size: 0.72rem; color: ${T.slate}; }

  .status-pill {
    font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 20px;
    flex-shrink: 0;
  }
  .status-pill.published { background: #E0F7EF; color: #00796B; }
  .status-pill.draft { background: #FFF8E1; color: #F57C00; }

  .row-actions { display: flex; gap: 0.4rem; flex-shrink: 0; }
  .icon-btn {
    width: 30px; height: 30px; border-radius: 8px; border: none;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
  }
  .icon-btn.view { background: ${T.ice}; color: ${T.blue}; }
  .icon-btn.view:hover { background: ${T.sky}; color: white; }
  .icon-btn.edit { background: #E8F5E9; color: #388E3C; }
  .icon-btn.edit:hover { background: #4CAF50; color: white; }
  .icon-btn.del { background: #FFEBEE; color: #C62828; }
  .icon-btn.del:hover { background: ${T.red}; color: white; }

  /* Right panel */
  .right-panels { display: flex; flex-direction: column; gap: 1.25rem; }

  .profile-card {
    background: linear-gradient(135deg, ${T.navy} 0%, ${T.navyLt} 100%);
    border-radius: 18px; padding: 1.75rem; color: white; position: relative; overflow: hidden;
  }
  .profile-card::after {
    content: ''; position: absolute; top: -40px; right: -40px;
    width: 130px; height: 130px; border-radius: 50%;
    background: rgba(66,165,245,0.12); pointer-events: none;
  }
  .profile-card::before {
    content: ''; position: absolute; bottom: -30px; left: -20px;
    width: 100px; height: 100px; border-radius: 50%;
    background: rgba(144,202,249,0.07); pointer-events: none;
  }
  .profile-avatar-lg {
    width: 58px; height: 58px; border-radius: 14px;
    background: linear-gradient(135deg, ${T.sky}, ${T.blue});
    display: flex; align-items: center; justify-content: center;
    font-size: 1.6rem; font-weight: 800; margin-bottom: 1rem;
    box-shadow: 0 4px 14px rgba(0,0,0,0.2);
  }
  .profile-name { font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 700; }
  .profile-email { font-size: 0.78rem; opacity: 0.6; margin-top: 2px; }
  .profile-role {
    display: inline-block; margin-top: 0.75rem; background: rgba(66,165,245,0.2);
    color: ${T.skyLt}; font-size: 0.7rem; font-weight: 800; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 1px; text-transform: uppercase;
  }
  .profile-stats {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-top: 1.25rem;
    padding-top: 1.25rem; border-top: 1px solid rgba(144,202,249,0.15);
  }
  .profile-stat { text-align: center; }
  .profile-stat-val { font-family: 'Sora', sans-serif; font-size: 1.3rem; font-weight: 800; }
  .profile-stat-lbl { font-size: 0.65rem; opacity: 0.55; margin-top: 1px; }

  .quick-panel {
    background: white; border-radius: 18px; padding: 1.5rem;
    box-shadow: 0 2px 12px rgba(11,31,58,0.06); border: 1px solid rgba(144,202,249,0.2);
  }
  .quick-title { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700;
    color: ${T.navy}; margin-bottom: 1rem; }
  .quick-btn {
    display: flex; align-items: center; gap: 0.8rem; width: 100%;
    padding: 0.75rem 1rem; border-radius: 10px; border: 1.5px solid ${T.ice};
    background: white; cursor: pointer; margin-bottom: 0.5rem; transition: all 0.18s;
    font-family: 'DM Sans', sans-serif; text-decoration: none; color: inherit;
  }
  .quick-btn:hover { border-color: ${T.sky}; background: ${T.icePale}; transform: translateX(3px); }
  .quick-btn-icon {
    width: 34px; height: 34px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;
  }
  .quick-btn-text { font-size: 0.85rem; font-weight: 600; color: ${T.navy}; }
  .quick-btn-sub { font-size: 0.72rem; color: ${T.slate}; }

  /* Empty state */
  .empty { text-align: center; padding: 3.5rem 2rem; color: ${T.slate}; }
  .empty-icon { font-size: 2.8rem; margin-bottom: 0.75rem; opacity: 0.4; }
  .empty p { font-size: 0.88rem; }

  /* Responsive */
  @media (max-width: 1100px) {
    .content-grid { grid-template-columns: 1fr; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 768px) {
    .sidebar { display: none; }
    .main { margin-left: 0; padding: 1.5rem; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

/* ─── MOCK DATA (replace with real API) ─────────────────────── */
const CATEGORY_EMOJI = {
  Technology:'💻', Lifestyle:'✨', Travel:'🌍', Food:'🍜', Health:'💪', Business:'📈', Other:'📌'
};

export default function Dashboard() {
  const [blogs, setBlogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [activeNav, setActiveNav] = useState('dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/blogs/my')
      .then(({ data }) => { setBlogs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const deleteBlog = async (id) => {
    if (!window.confirm('Delete this blog permanently?')) return;
    try {
      await API.delete(`/blogs/${id}`);
      setBlogs(blogs.filter(b => b._id !== id));
      toast.success('Blog deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = filter === 'all' ? blogs : blogs.filter(b => b.status === filter);
  const published = blogs.filter(b => b.status === 'published').length;
  const drafts    = blogs.filter(b => b.status === 'draft').length;
  const totalLikes = blogs.reduce((s, b) => s + (b.likes?.length || 0), 0);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || 'U';

  const navItems = [
    { id:'dashboard', icon:'⊞', label:'Dashboard' },
    { id:'blogs',     icon:'📝', label:'My Blogs', badge: blogs.length || null },
    { id:'create',    icon:'✦',  label:'New Blog', link:'/create' },
    { id:'home',      icon:'🏠', label:'Home Feed', link:'/' },
  ];
  const adminItems = user?.role === 'admin'
    ? [{ id:'admin', icon:'⚙️', label:'Admin Panel', link:'/admin' }]
    : [];

  return (
    <>
      <style>{css}</style>
      <div className="dash-root">

        {/* ── SIDEBAR ───────────────────────────── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h1>Blog<span>App</span></h1>
            <p>Content Platform</p>
          </div>

          <nav className="nav-section">
            <div className="nav-label">Menu</div>
            {navItems.map(item => (
              <div
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav(item.id);
                  if (item.link) navigate(item.link);
                }}
              >
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}

            {adminItems.length > 0 && (
              <>
                <div className="nav-label" style={{marginTop:'1.5rem'}}>Admin</div>
                {adminItems.map(item => (
                  <div key={item.id} className="nav-item"
                    onClick={() => navigate(item.link)}>
                    <span className="icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </>
            )}
          </nav>

          <div className="sidebar-footer">
            <div className="user-card" onClick={() => navigate('/dashboard')}>
              {user?.avatar
                ? <img src={user.avatar} alt="" className="user-avatar" style={{borderRadius:'10px'}} />
                : <div className="user-avatar">{initials}</div>
              }
              <div>
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-role">{user?.role || 'member'}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ──────────────────────────────── */}
        <main className="main">

          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-left">
              <h2>My Dashboard</h2>
              <p>Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋 Here's your overview</p>
            </div>
            <div className="topbar-actions">
              <button className="btn-ghost" onClick={() => navigate('/')}>
                🏠 Home Feed
              </button>
              <Link to="/create" className="btn-primary">
                ✦ New Blog
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {[
              { color:'blue',  icon:'📝', val: blogs.length,  label:'Total Blogs',   change:`${published} published`, dir:'up' },
              { color:'green', icon:'✅', val: published,      label:'Published',     change:`${Math.round(blogs.length ? published/blogs.length*100 : 0)}% publish rate`, dir:'up' },
              { color:'amber', icon:'📁', val: drafts,         label:'Drafts',        change:'Pending publish', dir:'neutral' },
              { color:'red',   icon:'❤️', val: totalLikes,     label:'Total Likes',   change:'Across all posts', dir:'up' },
            ].map((s,i) => (
              <div key={i} className={`stat-card ${s.color}`}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.val}</div>
                <div className="stat-label">{s.label}</div>
                <div className={`stat-change ${s.dir}`}>
                  {s.dir === 'up' ? '↑' : '•'} {s.change}
                </div>
              </div>
            ))}
          </div>

          {/* Main content grid */}
          <div className="content-grid">

            {/* Blog List Panel */}
            <div className="blogs-panel">
              <div className="panel-header">
                <span className="panel-title">My Blog Posts</span>
                <div className="filter-tabs">
                  {['all','published','draft'].map(f => (
                    <button key={f} className={`filter-tab ${filter===f?'active':''}`}
                      onClick={() => setFilter(f)}>
                      {f.charAt(0).toUpperCase()+f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="empty">
                  <div className="empty-icon">⏳</div>
                  <p>Loading your blogs...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  <p>No {filter !== 'all' ? filter : ''} blogs yet.</p>
                  <Link to="/create" style={{color: T.blue, fontWeight:600, fontSize:'0.85rem'}}>
                    Create your first blog →
                  </Link>
                </div>
              ) : (
                filtered.map(blog => (
                  <div key={blog._id} className="blog-row">
                    <div className="blog-thumb">
                      {blog.featuredImage
                        ? <img src={blog.featuredImage} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'10px'}} />
                        : (CATEGORY_EMOJI[blog.category] || '📝')
                      }
                    </div>
                    <div className="blog-info">
                      <div className="blog-title">{blog.title}</div>
                      <div className="blog-meta">
                        <span className="blog-cat">{blog.category}</span>
                        <span className="blog-date">
                          {new Date(blog.createdAt).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}
                        </span>
                        <span className="blog-likes">❤️ {blog.likes?.length||0}</span>
                      </div>
                    </div>
                    <span className={`status-pill ${blog.status}`}>{blog.status}</span>
                    <div className="row-actions">
                      <button className="icon-btn view" title="View"
                        onClick={() => navigate(`/blog/${blog._id}`)}>👁</button>
                      <button className="icon-btn edit" title="Edit"
                        onClick={() => navigate(`/edit/${blog._id}`)}>✏️</button>
                      <button className="icon-btn del" title="Delete"
                        onClick={() => deleteBlog(blog._id)}>🗑</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Panels */}
            <div className="right-panels">

              {/* Profile card */}
              <div className="profile-card">
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="profile-avatar-lg" style={{objectFit:'cover'}} />
                  : <div className="profile-avatar-lg">{initials}</div>
                }
                <div className="profile-name">{user?.name}</div>
                <div className="profile-email">{user?.email}</div>
                <div className="profile-role">{user?.role}</div>
                <div className="profile-stats">
                  <div className="profile-stat">
                    <div className="profile-stat-val">{blogs.length}</div>
                    <div className="profile-stat-lbl">Blogs</div>
                  </div>
                  <div className="profile-stat">
                    <div className="profile-stat-val">{published}</div>
                    <div className="profile-stat-lbl">Live</div>
                  </div>
                  <div className="profile-stat">
                    <div className="profile-stat-val">{totalLikes}</div>
                    <div className="profile-stat-lbl">Likes</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-panel">
                <div className="quick-title">⚡ Quick Actions</div>
                {[
                  { icon:'✦', bg: T.ice,     color: T.blue,  text:'Write New Blog',    sub:'Start a new post',      link:'/create' },
                  { icon:'🏠', bg:'#E8F5E9', color:'#388E3C', text:'Browse Home Feed',  sub:'See all published',     link:'/' },
                  ...(user?.role==='admin'
                    ? [{ icon:'⚙️', bg:'#F3E5F5', color:'#7B1FA2', text:'Admin Panel', sub:'Manage users & blogs',  link:'/admin' }]
                    : []
                  ),
                ].map((q,i) => (
                  <div key={i} className="quick-btn" onClick={() => navigate(q.link)}
                    style={{cursor:'pointer'}}>
                    <div className="quick-btn-icon" style={{background:q.bg, color:q.color}}>
                      {q.icon}
                    </div>
                    <div>
                      <div className="quick-btn-text">{q.text}</div>
                      <div className="quick-btn-sub">{q.sub}</div>
                    </div>
                  </div>
                ))}
              </div>


            </div>
          </div>
        </main>
      </div>
    </>
  );
}