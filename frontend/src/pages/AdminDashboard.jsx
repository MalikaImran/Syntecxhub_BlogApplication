import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
:root{
  --navy:#0B1F3A;--navyM:#112D4E;--navyL:#1A3D5C;
  --blue:#1565C0;--sky:#42A5F5;--skyL:#90CAF9;
  --ice:#E3F2FD;--iceP:#F0F8FF;--bg:#F4F7FB;
  --green:#00C897;--amber:#FFB300;--red:#FF5252;--purple:#8B5CF6;
}
.adm{font-family:'DM Sans',sans-serif;background:var(--bg);min-height:100vh;}
.adm *{box-sizing:border-box;margin:0;padding:0;}

/* ── SIDEBAR ─────────────────────────────────────────────── */
.sb{
  position:fixed;top:0;left:0;width:250px;height:100vh;
  background:linear-gradient(170deg,var(--navy) 0%,var(--navyM) 60%,var(--navyL) 100%);
  display:flex;flex-direction:column;z-index:100;
  box-shadow:4px 0 28px rgba(11,31,58,.22);
}
.sb::after{
  content:'';position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(rgba(144,202,249,.07) 1px,transparent 1px);
  background-size:26px 26px;
}
.sb-logo{padding:1.75rem 1.5rem 1.25rem;border-bottom:1px solid rgba(144,202,249,.1);position:relative;z-index:1;}
.sb-logo h1{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:900;color:#fff;letter-spacing:-.5px;}
.sb-logo h1 span{color:var(--sky);}
.sb-logo p{font-size:.6rem;color:var(--skyL);opacity:.4;margin-top:2px;letter-spacing:3px;text-transform:uppercase;}
.sb-nav{padding:1rem .75rem;flex:1;overflow-y:auto;position:relative;z-index:1;}
.sb-lbl{font-size:.58rem;font-weight:900;color:var(--skyL);opacity:.35;letter-spacing:3px;text-transform:uppercase;padding:0 .75rem;margin:1.2rem 0 .4rem;}
.sb-item{
  display:flex;align-items:center;gap:.7rem;
  padding:.68rem .75rem;border-radius:10px;cursor:pointer;
  transition:all .18s;color:rgba(144,202,249,.55);
  font-size:.85rem;font-weight:500;margin-bottom:2px;
}
.sb-item:hover{background:rgba(66,165,245,.1);color:var(--skyL);}
.sb-item.on{
  background:linear-gradient(90deg,rgba(21,101,192,.52),rgba(66,165,245,.15));
  color:#fff;box-shadow:inset 3px 0 0 var(--sky);
}
.sb-item .ic{font-size:.95rem;width:20px;text-align:center;}
.sb-bdg{
  margin-left:auto;font-size:.6rem;font-weight:900;
  padding:1px 7px;border-radius:20px;
}
.sb-bdg.b{background:var(--sky);color:var(--navy);}
.sb-bdg.r{background:var(--red);color:#fff;}
.sb-foot{padding:1rem 1.25rem;border-top:1px solid rgba(144,202,249,.1);position:relative;z-index:1;}
.sb-back{
  display:flex;align-items:center;gap:.6rem;width:100%;
  padding:.65rem .85rem;border-radius:10px;
  border:1px solid rgba(144,202,249,.15);background:rgba(255,255,255,.04);
  color:var(--skyL);font-size:.82rem;font-weight:600;cursor:pointer;
  transition:all .18s;font-family:'DM Sans',sans-serif;
}
.sb-back:hover{background:rgba(255,255,255,.09);}

/* ── MAIN ────────────────────────────────────────────────── */
.mn{margin-left:250px;padding:2rem 2.5rem;min-height:100vh;}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;}
.top h2{font-family:'Playfair Display',serif;font-size:1.65rem;font-weight:900;color:var(--navy);letter-spacing:-.5px;}
.top p{color:#546E7A;font-size:.85rem;margin-top:2px;}
.top-r{display:flex;gap:.75rem;align-items:center;}
.live{display:flex;align-items:center;gap:.4rem;background:#E8F5E9;color:#2E7D32;border-radius:20px;font-size:.72rem;font-weight:800;padding:.35rem .9rem;}
.live-dot{width:7px;height:7px;border-radius:50%;background:#4CAF50;animation:blink 1.5s infinite;}
@keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(1.6)}}

/* ── STAT CARDS ──────────────────────────────────────────── */
.sc-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:1rem;margin-bottom:2rem;}
.sc{
  background:#fff;border-radius:16px;padding:1.1rem 1rem;
  border:1px solid rgba(144,202,249,.15);
  box-shadow:0 2px 10px rgba(11,31,58,.05);
  transition:transform .2s,box-shadow .2s;position:relative;overflow:hidden;
}
.sc:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(11,31,58,.1);}
.sc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;}
.sc.c1::before{background:linear-gradient(90deg,var(--blue),var(--sky));}
.sc.c2::before{background:linear-gradient(90deg,#F57C00,var(--amber));}
.sc.c3::before{background:linear-gradient(90deg,#00796B,var(--green));}
.sc.c4::before{background:linear-gradient(90deg,#6A1B9A,var(--purple));}
.sc.c5::before{background:linear-gradient(90deg,#C62828,var(--red));}
.sc.c6::before{background:linear-gradient(90deg,#E65100,#FF8A65);}
.sc.c7::before{background:linear-gradient(90deg,#1565C0,#00BCD4);}
.sc-ic{font-size:1.35rem;margin-bottom:.6rem;display:block;}
.sc-val{font-family:'Playfair Display',serif;font-size:1.65rem;font-weight:900;color:var(--navy);line-height:1;}
.sc-lbl{font-size:.7rem;color:#546E7A;margin-top:3px;font-weight:500;}

/* ── PANELS ──────────────────────────────────────────────── */
.panel{background:#fff;border-radius:18px;border:1px solid rgba(144,202,249,.15);box-shadow:0 2px 12px rgba(11,31,58,.05);overflow:hidden;margin-bottom:1.5rem;}
.ph{display:flex;justify-content:space-between;align-items:center;padding:1.2rem 1.5rem;border-bottom:1px solid var(--iceP);}
.pt{font-family:'Playfair Display',serif;font-size:1rem;font-weight:800;color:var(--navy);}
.ps{font-size:.75rem;color:#aaa;margin-top:1px;}

/* ── TABLE ───────────────────────────────────────────────── */
.tbl{width:100%;border-collapse:collapse;}
.tbl thead tr{background:var(--iceP);}
.tbl th{padding:.7rem 1.1rem;text-align:left;font-size:.67rem;font-weight:900;color:#546E7A;text-transform:uppercase;letter-spacing:1.2px;border-bottom:2px solid var(--ice);}
.tbl td{padding:.8rem 1.1rem;border-bottom:1px solid #F5F9FF;font-size:.85rem;color:#333;}
.tbl tbody tr{transition:background .15s;}
.tbl tbody tr:hover{background:var(--iceP);}
.tbl tbody tr.sel-row{background:#EEF6FF;}
.tbl tbody tr:last-child td{border-bottom:none;}

/* Checkbox */
.chk{width:16px;height:16px;cursor:pointer;accent-color:var(--blue);}

/* Avatar */
.av{width:30px;height:30px;border-radius:8px;flex-shrink:0;background:linear-gradient(135deg,var(--blue),var(--sky));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:.75rem;object-fit:cover;}

/* Pills */
.pill{display:inline-block;padding:2px 9px;border-radius:12px;font-size:.67rem;font-weight:800;}
.pill.admin  {background:#E8F5E9;color:#2E7D32;}
.pill.user   {background:var(--ice);color:var(--blue);}
.pill.pub    {background:#E0F7EF;color:#00796B;}
.pill.draft  {background:#FFF8E1;color:#F57C00;}
.pill.banned {background:#FFEBEE;color:#C62828;}
.pill.feat   {background:#FFF9C4;color:#F9A825;}

/* Buttons */
.btn{padding:.3rem .75rem;border-radius:8px;border:none;font-size:.73rem;font-weight:700;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif;}
.btn.del  {background:#FFEBEE;color:#C62828;}  .btn.del:hover{background:var(--red);color:#fff;}
.btn.pro  {background:var(--ice);color:var(--blue);}  .btn.pro:hover{background:var(--blue);color:#fff;}
.btn.ban  {background:#FFF8E1;color:#E65100;}  .btn.ban:hover{background:#FF8A65;color:#fff;}
.btn.unbn {background:#E0F7EF;color:#00796B;} .btn.unbn:hover{background:var(--green);color:#fff;}
.btn.eye  {background:var(--iceP);color:var(--blue);} .btn.eye:hover{background:var(--sky);color:#fff;}
.btn.feat {background:#FFF9C4;color:#F9A825;} .btn.feat:hover{background:#F9A825;color:#fff;}
.btn.unfeat{background:#E8F5E9;color:#2E7D32;} .btn.unfeat:hover{background:var(--green);color:#fff;}
.btn.bulk-del{background:var(--red);color:#fff;padding:.45rem 1.1rem;border-radius:9px;font-size:.82rem;}
.btn.bulk-del:hover{background:#C62828;}
.btn.primary{background:linear-gradient(135deg,var(--navy),var(--blue));color:#fff;padding:.55rem 1.3rem;border-radius:10px;font-size:.85rem;box-shadow:0 3px 12px rgba(11,31,58,.2);}
.btn.primary:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(11,31,58,.28);}
.btn.ghost{background:#fff;color:var(--navy);border:1.5px solid var(--ice);padding:.5rem 1.1rem;border-radius:10px;font-size:.85rem;}
.btn.ghost:hover{border-color:var(--sky);color:var(--blue);background:var(--iceP);}

/* Bulk action bar */
.bulk-bar{
  display:flex;align-items:center;gap:1rem;
  padding:.75rem 1.5rem;background:linear-gradient(90deg,var(--navy),var(--navyM));
  border-radius:10px;margin-bottom:1rem;
}
.bulk-bar span{color:#fff;font-size:.85rem;font-weight:700;}

/* Search */
.srch{display:flex;align-items:center;gap:.5rem;background:var(--iceP);border:1.5px solid var(--ice);border-radius:10px;padding:.45rem .85rem;}
.srch input{border:none;background:transparent;outline:none;font-family:'DM Sans',sans-serif;font-size:.86rem;color:var(--navy);width:170px;}
.srch input::placeholder{color:#bbb;}

/* Bar charts */
.bar-w{margin-bottom:1.1rem;}
.bar-top{display:flex;justify-content:space-between;font-size:.8rem;font-weight:600;color:var(--navy);margin-bottom:5px;}
.bar-track{height:8px;background:var(--iceP);border-radius:4px;overflow:hidden;}
.bar-fill{height:100%;border-radius:4px;transition:width 1.2s cubic-bezier(.4,0,.2,1);}

/* Category grid */
.cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:.75rem;padding:1.25rem 1.5rem;}
.cat-c{padding:1rem;border-radius:12px;text-align:center;transition:all .2s;}
.cat-c:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(11,31,58,.1);}
.cat-emoji{font-size:1.7rem;margin-bottom:.35rem;}
.cat-val{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:900;color:var(--navy);}
.cat-lbl{font-size:.7rem;color:#546E7A;font-weight:600;margin-top:2px;}

/* Overview big metric */
.big-metric{
  padding:1rem 1.25rem;
  background:linear-gradient(135deg,var(--navy),var(--navyM));
  border-radius:12px;display:flex;justify-content:space-between;align-items:center;
}
.big-metric-lbl{font-size:.7rem;color:var(--skyL);opacity:.6;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;}
.big-metric-val{font-family:'Playfair Display',serif;font-size:2.1rem;font-weight:900;color:#fff;line-height:1;}

/* Announcement */
.ann-area{width:100%;padding:.85rem 1rem;border:2px solid var(--ice);border-radius:12px;font-family:'DM Sans',sans-serif;font-size:.92rem;color:var(--navy);outline:none;resize:vertical;min-height:110px;transition:border-color .2s;}
.ann-area:focus{border-color:var(--sky);box-shadow:0 0 0 4px rgba(66,165,245,.1);}

/* Feature lists */
.fi{display:flex;align-items:center;gap:.6rem;padding:.5rem 0;font-size:.82rem;color:var(--navy);}
.fi-ck{width:20px;height:20px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:900;}

/* Empty */
.empty{text-align:center;padding:3rem;color:#aaa;}
.empty-ic{font-size:2.5rem;margin-bottom:.75rem;opacity:.35;}

/* Grid helpers */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;}

/* Responsive */
@media(max-width:1200px){.sc-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:900px){
  .sb{display:none;} .mn{margin-left:0;padding:1.5rem;}
  .sc-grid{grid-template-columns:repeat(2,1fr);}
  .g2{grid-template-columns:1fr;}
}
`;

const CAT_CFG = {
  Technology:{emoji:'💻',bg:'#E3F2FD',color:'#1565C0'},
  Lifestyle:  {emoji:'✨',bg:'#F3E5F5',color:'#6A1B9A'},
  Travel:     {emoji:'🌍',bg:'#E0F2F1',color:'#00695C'},
  Food:       {emoji:'🍜',bg:'#FFF3E0',color:'#E65100'},
  Health:     {emoji:'💪',bg:'#E8F5E9',color:'#2E7D32'},
  Business:   {emoji:'📈',bg:'#E8EAF6',color:'#283593'},
  Other:      {emoji:'📌',bg:'#ECEFF1',color:'#546E7A'},
};

export default function AdminDashboard() {
  const [tab, setTab]           = useState('overview');
  const [users, setUsers]       = useState([]);
  const [blogs, setBlogs]       = useState([]);
  const [comments, setComments] = useState([]);
  const [stats, setStats]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [uQ, setUQ]             = useState('');
  const [bQ, setBQ]             = useState('');
  const [cQ, setCQ]             = useState('');
  const [ann, setAnn]           = useState('');

  // Bulk selection
  const [selUsers, setSelUsers] = useState(new Set());
  const [selBlogs, setSelBlogs] = useState(new Set());

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get('/users/admin/users'),
      API.get('/users/admin/stats'),
      API.get('/users/admin/blogs'),
      API.get('/users/admin/comments'),
    ]).then(([u, s, b, c]) => {
      setUsers(u.data); setStats(s.data); setBlogs(b.data); setComments(c.data);
      setLoading(false);
    }).catch(() => { toast.error('Failed to load admin data'); setLoading(false); });
  }, []);

  /* ── Actions ─────────────────────────── */
  const deleteUser = async (id) => {
    if (!window.confirm('Delete user + all their content?')) return;
    try {
      await API.delete(`/users/admin/users/${id}`);
      setUsers(u => u.filter(x => x._id !== id));
      toast.success('User deleted');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const promoteUser = async (id, role) => {
    if (!window.confirm(`${role==='admin'?'Demote':'Promote'} this user?`)) return;
    try {
      const { data } = await API.put(`/users/admin/users/${id}/promote`);
      setUsers(u => u.map(x => x._id === id ? { ...x, role: data.role } : x));
      toast.success(`User is now ${data.role}!`);
    } catch { toast.error('Failed'); }
  };

  const banUser = async (id, isBanned) => {
    const reason = isBanned ? null : (window.prompt('Ban reason:', 'Violation of terms') ?? 'Cancelled');
    if (reason === 'Cancelled') return;
    try {
      const { data } = await API.put(`/users/admin/users/${id}/ban`, { reason });
      setUsers(u => u.map(x => x._id === id ? { ...x, isBanned: data.isBanned } : x));
      toast.success(data.message);
    } catch { toast.error('Failed'); }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm('Delete this blog?')) return;
    try {
      await API.delete(`/users/admin/blogs/${id}`);
      setBlogs(b => b.filter(x => x._id !== id));
      toast.success('Blog deleted');
    } catch { toast.error('Failed'); }
  };

  const toggleFeature = async (id, isFeatured) => {
    try {
      const { data } = await API.put(`/users/admin/blogs/${id}/feature`);
      setBlogs(b => b.map(x => x._id === id ? { ...x, isFeatured: data.isFeatured } : x));
      toast.success(data.message);
    } catch { toast.error('Failed'); }
  };

  const deleteComment = async (id) => {
    try {
      await API.delete(`/users/admin/comments/${id}`);
      setComments(c => c.filter(x => x._id !== id));
      toast.success('Comment deleted');
    } catch { toast.error('Failed'); }
  };

  /* ── Bulk actions ────────────────────── */
  const toggleSelUser = (id) => setSelUsers(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelBlog = (id) => setSelBlogs(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selectAllUsers = (list) => setSelUsers(s => s.size === list.length ? new Set() : new Set(list.map(u => u._id)));
  const selectAllBlogs = (list) => setSelBlogs(s => s.size === list.length ? new Set() : new Set(list.map(b => b._id)));

  const bulkDeleteUsers = async () => {
    if (!selUsers.size) return;
    if (!window.confirm(`Delete ${selUsers.size} users?`)) return;
    try {
      await API.delete('/users/admin/users/bulk', { data: { ids: [...selUsers] } });
      setUsers(u => u.filter(x => !selUsers.has(x._id)));
      setSelUsers(new Set());
      toast.success(`${selUsers.size} users deleted`);
    } catch { toast.error('Failed'); }
  };

  const bulkDeleteBlogs = async () => {
    if (!selBlogs.size) return;
    if (!window.confirm(`Delete ${selBlogs.size} blogs?`)) return;
    try {
      await API.delete('/users/admin/blogs/bulk', { data: { ids: [...selBlogs] } });
      setBlogs(b => b.filter(x => !selBlogs.has(x._id)));
      setSelBlogs(new Set());
      toast.success(`${selBlogs.size} blogs deleted`);
    } catch { toast.error('Failed'); }
  };

  /* ── Filtered lists ──────────────────── */
  const fU = users.filter(u => u.name.toLowerCase().includes(uQ.toLowerCase()) || u.email.toLowerCase().includes(uQ.toLowerCase()));
  const fB = blogs.filter(b => b.title.toLowerCase().includes(bQ.toLowerCase()));
  const fC = comments.filter(c => c.text?.toLowerCase().includes(cQ.toLowerCase()) || c.author?.name?.toLowerCase().includes(cQ.toLowerCase()));

  const bannedCnt   = users.filter(u => u.isBanned).length;
  const featuredCnt = blogs.filter(b => b.isFeatured).length;
  const publishRate = stats.totalBlogs ? Math.round((stats.publishedBlogs / stats.totalBlogs) * 100) : 0;

  const navItems = [
    { id:'overview',     ic:'⊞',  lbl:'Overview' },
    { id:'users',        ic:'👥', lbl:'Users',        cnt:users.length,    bc:'b' },
    { id:'blogs',        ic:'📝', lbl:'Blogs',         cnt:blogs.length,    bc:'b' },
    { id:'comments',     ic:'💬', lbl:'Comments',      cnt:comments.length, bc:'b' },
    { id:'announcement', ic:'📢', lbl:'Announcement' },
  ];

  if (loading) return (
    <>
      <style>{css}</style>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--bg)',fontFamily:'DM Sans,sans-serif'}}>
        <div style={{textAlign:'center',color:'#aaa'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'1rem',animation:'blink 1s infinite'}}>⚙️</div>
          <p style={{fontWeight:600}}>Loading Admin Panel...</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="adm">

        {/* ── SIDEBAR ─────────────────────────────── */}
        <aside className="sb">
          <div className="sb-logo">
            <h1>Blog<span>App</span></h1>
            <p>⚙ Admin Panel</p>
          </div>

          <nav className="sb-nav">
            <div className="sb-lbl">Control Panel</div>
            {navItems.map(n => (
              <div key={n.id} className={`sb-item ${tab===n.id?'on':''}`} onClick={() => setTab(n.id)}>
                <span className="ic">{n.ic}</span>
                <span>{n.lbl}</span>
                {n.cnt > 0 && <span className={`sb-bdg ${n.bc}`}>{n.cnt}</span>}
              </div>
            ))}

            {bannedCnt > 0 && (
              <>
                <div className="sb-lbl">Alerts</div>
                <div className="sb-item" style={{color:'var(--red)',background:'rgba(255,82,82,.07)'}}
                  onClick={() => setTab('users')}>
                  <span className="ic">🔒</span>
                  <span>Banned Users</span>
                  <span className="sb-bdg r">{bannedCnt}</span>
                </div>
              </>
            )}
          </nav>

          <div className="sb-foot">
            <button className="sb-back" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          </div>
        </aside>

        {/* ── MAIN ────────────────────────────────── */}
        <main className="mn">

          {/* Topbar */}
          <div className="top">
            <div>
              <h2>⚙️ Admin Dashboard</h2>
              <p>Full platform control — users, content, comments & announcements</p>
            </div>
            <div className="top-r">
              <div className="live"><span className="live-dot"/>Live</div>
              <button className="btn primary" onClick={() => navigate('/')}>🏠 View Site</button>
            </div>
          </div>

          {/* STAT CARDS — now 7 including views */}
          <div className="sc-grid" style={{gridTemplateColumns:'repeat(7,1fr)'}}>
            {[
              {cl:'c1',ic:'👥',val:stats.totalUsers,    lbl:'Users'},
              {cl:'c5',ic:'🔒',val:bannedCnt,           lbl:'Banned'},
              {cl:'c2',ic:'📝',val:stats.totalBlogs,    lbl:'Blogs'},
              {cl:'c3',ic:'✅',val:stats.publishedBlogs,lbl:'Published'},
              {cl:'c4',ic:'📁',val:stats.draftBlogs,    lbl:'Drafts'},
              {cl:'c6',ic:'💬',val:stats.totalComments, lbl:'Comments'},
              {cl:'c7',ic:'👁',val:stats.totalViews||0, lbl:'Total Views'},
            ].map((s,i) => (
              <div key={i} className={`sc ${s.cl}`}>
                <span className="sc-ic">{s.ic}</span>
                <div className="sc-val">{s.val ?? '—'}</div>
                <div className="sc-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* ═══════════════════════════════════════
              TAB: OVERVIEW
          ════════════════════════════════════════ */}
          {tab === 'overview' && (
            <div className="g2">
              {/* Analytics col */}
              <div>
                <div className="panel">
                  <div className="ph">
                    <div><div className="pt">📊 Content Analytics</div><div className="ps">Platform performance</div></div>
                  </div>
                  <div style={{padding:'1.5rem'}}>
                    {[
                      {lbl:'Published',   val:stats.publishedBlogs||0, tot:stats.totalBlogs||1, color:'#00C897'},
                      {lbl:'Drafts',      val:stats.draftBlogs||0,     tot:stats.totalBlogs||1, color:'#FFB300'},
                      {lbl:'Active Users',val:(stats.totalUsers||0)-bannedCnt, tot:stats.totalUsers||1, color:'#42A5F5'},
                      {lbl:'Banned',      val:bannedCnt, tot:stats.totalUsers||1, color:'#FF5252'},
                    ].map((b,i) => (
                      <div key={i} className="bar-w">
                        <div className="bar-top"><span>{b.lbl}</span><span style={{color:b.color,fontWeight:800}}>{b.val}</span></div>
                        <div className="bar-track"><div className="bar-fill" style={{width:`${Math.round(b.val/b.tot*100)}%`,background:b.color}}/></div>
                      </div>
                    ))}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem',marginTop:'1.25rem'}}>
                      <div className="big-metric">
                        <div><div className="big-metric-lbl">Publish Rate</div><div className="big-metric-val">{publishRate}<span style={{fontSize:'1rem'}}>%</span></div></div>
                        <span style={{fontSize:'2rem',opacity:.25}}>📈</span>
                      </div>
                      <div className="big-metric" style={{background:'linear-gradient(135deg,#1A3D5C,#1565C0)'}}>
                        <div><div className="big-metric-lbl">Total Views</div><div className="big-metric-val">{stats.totalViews||0}</div></div>
                        <span style={{fontSize:'2rem',opacity:.25}}>👁</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured blogs */}
                <div className="panel">
                  <div className="ph">
                    <div><div className="pt">⭐ Featured Blogs</div><div className="ps">{featuredCnt} pinned to homepage</div></div>
                    <button className="btn ghost" style={{fontSize:'.78rem'}} onClick={()=>setTab('blogs')}>Manage →</button>
                  </div>
                  {blogs.filter(b=>b.isFeatured).length === 0 ? (
                    <div className="empty"><div className="empty-ic">⭐</div><p>No featured blogs yet.<br/>Go to Blogs tab and star one!</p></div>
                  ) : (
                    blogs.filter(b=>b.isFeatured).slice(0,4).map((b,i) => (
                      <div key={i} style={{
                        display:'flex',alignItems:'center',gap:'1rem',
                        padding:'.85rem 1.5rem',borderBottom:'1px solid var(--iceP)'
                      }}>
                        <span style={{fontSize:'1.3rem'}}>{CAT_CFG[b.category]?.emoji||'📝'}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,color:'var(--navy)',fontSize:'.88rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.title}</div>
                          <div style={{fontSize:'.72rem',color:'#aaa'}}>{b.author?.name} · 👁 {b.views||0} views</div>
                        </div>
                        <span className="pill feat">⭐ Featured</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right col */}
              <div>
                <div className="panel">
                  <div className="ph"><div className="pt">👥 User Breakdown</div></div>
                  <div style={{padding:'.75rem 1.5rem'}}>
                    {[
                      {ic:'🌐',lbl:'Total Users',   val:stats.totalUsers||0,     color:'var(--blue)'},
                      {ic:'⚙️',lbl:'Admins',        val:users.filter(u=>u.role==='admin').length, color:'#8B5CF6'},
                      {ic:'👤',lbl:'Active Users',  val:(stats.totalUsers||0)-bannedCnt, color:'var(--green)'},
                      {ic:'🔒',lbl:'Banned Users',  val:bannedCnt,              color:'var(--red)'},
                    ].map((r,i) => (
                      <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.65rem 0',borderBottom:i<3?'1px solid var(--iceP)':'none'}}>
                        <span style={{fontSize:'.85rem',color:'#546E7A',display:'flex',gap:'.5rem'}}>{r.ic} {r.lbl}</span>
                        <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',fontWeight:900,color:r.color}}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="ph"><div className="pt">🏷 Blogs by Category</div></div>
                  <div className="cat-grid">
                    {(stats.categoryStats||[]).map((c,i) => {
                      const cfg = CAT_CFG[c._id]||CAT_CFG.Other;
                      return (
                        <div key={i} className="cat-c" style={{background:cfg.bg,border:`1.5px solid ${cfg.color}22`}}>
                          <div className="cat-emoji">{cfg.emoji}</div>
                          <div className="cat-val" style={{color:cfg.color}}>{c.count}</div>
                          <div className="cat-lbl">{c._id}</div>
                        </div>
                      );
                    })}
                    {(!stats.categoryStats||stats.categoryStats.length===0)&&(
                      <div style={{gridColumn:'1/-1',textAlign:'center',padding:'1.5rem',color:'#aaa',fontSize:'.85rem'}}>No blogs yet</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
              TAB: USERS
          ════════════════════════════════════════ */}
          {tab === 'users' && (
            <>
              {selUsers.size > 0 && (
                <div className="bulk-bar">
                  <span>☑ {selUsers.size} users selected</span>
                  <button className="btn bulk-del" onClick={bulkDeleteUsers}>🗑 Delete Selected</button>
                  <button className="btn ghost" style={{marginLeft:'auto'}} onClick={()=>setSelUsers(new Set())}>Clear Selection</button>
                </div>
              )}
              <div className="panel">
                <div className="ph">
                  <div><div className="pt">👥 All Users</div><div className="ps">{users.length} registered · {bannedCnt} banned</div></div>
                  <div className="srch"><span>🔍</span><input placeholder="Search name or email…" value={uQ} onChange={e=>setUQ(e.target.value)}/></div>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table className="tbl">
                    <thead><tr>
                      <th><input type="checkbox" className="chk" onChange={()=>selectAllUsers(fU)} checked={selUsers.size===fU.length&&fU.length>0}/></th>
                      {['User','Email','Role','Status','Joined','Blogs','Actions'].map(h=><th key={h}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {fU.length===0 ? (
                        <tr><td colSpan={8}><div className="empty"><div className="empty-ic">🔍</div><p>No users found</p></div></td></tr>
                      ) : fU.map(u => (
                        <tr key={u._id} className={selUsers.has(u._id)?'sel-row':''} style={{opacity:u.isBanned?.6:1}}>
                          <td><input type="checkbox" className="chk" checked={selUsers.has(u._id)} onChange={()=>toggleSelUser(u._id)}/></td>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
                              {u.avatar?<img src={u.avatar} alt="" className="av"/>:<div className="av">{u.name?.[0]?.toUpperCase()}</div>}
                              <span style={{fontWeight:600,color:'var(--navy)'}}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{color:'#546E7A',fontSize:'.82rem'}}>{u.email}</td>
                          <td><span className={`pill ${u.role}`}>{u.role}</span></td>
                          <td>{u.isBanned?<span className="pill banned">🔒 Banned</span>:<span style={{fontSize:'.72rem',color:'var(--green)',fontWeight:700}}>✓ Active</span>}</td>
                          <td style={{color:'#aaa',fontSize:'.78rem'}}>{new Date(u.createdAt).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</td>
                          <td style={{color:'var(--blue)',fontWeight:700,textAlign:'center'}}>{blogs.filter(b=>b.author?._id===u._id).length}</td>
                          <td>
                            {u.role!=='admin' && (
                              <div style={{display:'flex',gap:'.35rem',flexWrap:'wrap'}}>
                                <button className="btn pro"  onClick={()=>promoteUser(u._id,u.role)}>{u.role==='admin'?'↓ Demote':'↑ Promote'}</button>
                                <button className={`btn ${u.isBanned?'unbn':'ban'}`} onClick={()=>banUser(u._id,u.isBanned)}>{u.isBanned?'🔓 Unban':'🔒 Ban'}</button>
                                <button className="btn del"  onClick={()=>deleteUser(u._id)}>🗑</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════
              TAB: BLOGS
          ════════════════════════════════════════ */}
          {tab === 'blogs' && (
            <>
              {selBlogs.size > 0 && (
                <div className="bulk-bar">
                  <span>☑ {selBlogs.size} blogs selected</span>
                  <button className="btn bulk-del" onClick={bulkDeleteBlogs}>🗑 Delete Selected</button>
                  <button className="btn ghost" style={{marginLeft:'auto'}} onClick={()=>setSelBlogs(new Set())}>Clear Selection</button>
                </div>
              )}
              <div className="panel">
                <div className="ph">
                  <div><div className="pt">📝 All Blogs</div><div className="ps">{blogs.length} posts · ⭐ {featuredCnt} featured</div></div>
                  <div className="srch"><span>🔍</span><input placeholder="Search blogs…" value={bQ} onChange={e=>setBQ(e.target.value)}/></div>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table className="tbl">
                    <thead><tr>
                      <th><input type="checkbox" className="chk" onChange={()=>selectAllBlogs(fB)} checked={selBlogs.size===fB.length&&fB.length>0}/></th>
                      {['Title','Author','Category','Status','Views','Likes','Date','Actions'].map(h=><th key={h}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {fB.length===0 ? (
                        <tr><td colSpan={9}><div className="empty"><div className="empty-ic">📭</div><p>No blogs found</p></div></td></tr>
                      ) : fB.map(b => (
                        <tr key={b._id} className={selBlogs.has(b._id)?'sel-row':''}>
                          <td><input type="checkbox" className="chk" checked={selBlogs.has(b._id)} onChange={()=>toggleSelBlog(b._id)}/></td>
                          <td style={{maxWidth:'180px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:'.4rem'}}>
                              {b.isFeatured && <span title="Featured">⭐</span>}
                              <span style={{fontWeight:600,color:'var(--navy)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.title}</span>
                            </div>
                          </td>
                          <td style={{color:'#546E7A'}}>{b.author?.name}</td>
                          <td><span style={{fontSize:'.75rem',color:CAT_CFG[b.category]?.color||'var(--blue)',fontWeight:700}}>{CAT_CFG[b.category]?.emoji} {b.category}</span></td>
                          <td><span className={`pill ${b.status==='published'?'pub':'draft'}`}>{b.status}</span></td>
                          <td style={{color:'#546E7A',fontWeight:600}}>👁 {b.views||0}</td>
                          <td style={{color:'var(--red)',fontWeight:700}}>❤️ {b.likes?.length||0}</td>
                          <td style={{color:'#aaa',fontSize:'.78rem'}}>{new Date(b.createdAt).toLocaleDateString('en-PK',{day:'numeric',month:'short'})}</td>
                          <td>
                            <div style={{display:'flex',gap:'.3rem',flexWrap:'wrap'}}>
                              <button className={`btn ${b.isFeatured?'unfeat':'feat'}`} onClick={()=>toggleFeature(b._id,b.isFeatured)}>
                                {b.isFeatured?'★ Unfeature':'☆ Feature'}
                              </button>
                              <button className="btn eye" onClick={()=>navigate(`/blog/${b._id}`)}>👁</button>
                              <button className="btn del" onClick={()=>deleteBlog(b._id)}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════
              TAB: COMMENTS
          ════════════════════════════════════════ */}
          {tab === 'comments' && (
            <div className="panel">
              <div className="ph">
                <div><div className="pt">💬 All Comments</div><div className="ps">{comments.length} total · last 100 shown</div></div>
                <div className="srch"><span>🔍</span><input placeholder="Search comments…" value={cQ} onChange={e=>setCQ(e.target.value)}/></div>
              </div>
              <div style={{overflowX:'auto'}}>
                <table className="tbl">
                  <thead><tr>{['Author','Comment','Blog','Date','Action'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {fC.length===0 ? (
                      <tr><td colSpan={5}><div className="empty"><div className="empty-ic">💬</div><p>No comments found</p></div></td></tr>
                    ) : fC.map(c => (
                      <tr key={c._id}>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
                            {c.author?.avatar?<img src={c.author.avatar} className="av" alt=""/>:<div className="av">{c.author?.name?.[0]?.toUpperCase()}</div>}
                            <span style={{fontWeight:600,color:'var(--navy)',fontSize:'.84rem'}}>{c.author?.name}</span>
                          </div>
                        </td>
                        <td style={{maxWidth:'250px'}}>
                          <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#444',fontSize:'.84rem'}}>{c.text}</div>
                        </td>
                        <td style={{maxWidth:'140px'}}>
                          <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--blue)',fontSize:'.78rem',fontWeight:600,cursor:'pointer'}}
                            onClick={()=>navigate(`/blog/${c.blog?._id}`)}>
                            {c.blog?.title||'—'}
                          </div>
                        </td>
                        <td style={{color:'#aaa',fontSize:'.78rem'}}>{new Date(c.createdAt).toLocaleDateString('en-PK',{day:'numeric',month:'short'})}</td>
                        <td><button className="btn del" onClick={()=>deleteComment(c._id)}>🗑 Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
              TAB: ANNOUNCEMENT
          ════════════════════════════════════════ */}
          {tab === 'announcement' && (
            <div className="g2">
              <div className="panel">
                <div className="ph">
                  <div><div className="pt">📢 Send Announcement</div><div className="ps">Broadcast message to all users</div></div>
                </div>
                <div style={{padding:'1.5rem'}}>
                  <label style={{display:'block',fontSize:'.8rem',fontWeight:700,color:'var(--navy)',marginBottom:'.5rem'}}>Message</label>
                  <textarea className="ann-area" placeholder="e.g. 'We have launched video upload! 🎥'" value={ann} onChange={e=>setAnn(e.target.value)}/>
                  <div style={{display:'flex',gap:'.75rem',marginTop:'1rem'}}>
                    <button className="btn primary" onClick={()=>{if(!ann.trim())return toast.error('Write something!');toast.success('📢 Ready to send! Connect NodeMailer/SendGrid.');setAnn('');}}>📢 Send</button>
                    <button className="btn ghost" onClick={()=>setAnn('')}>Clear</button>
                  </div>
                  <div style={{marginTop:'1.25rem',padding:'1rem',background:'var(--iceP)',borderRadius:'10px',border:'1px solid var(--ice)'}}>
                    <p style={{fontSize:'.78rem',color:'#546E7A',lineHeight:1.7}}>
                      💡 Connect <strong>NodeMailer</strong> or <strong>SendGrid</strong> to backend route <code style={{background:'var(--ice)',padding:'1px 5px',borderRadius:'4px',fontSize:'.73rem'}}>/api/users/admin/announce</code> to actually send emails.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature comparison */}
             
            </div>
          )}

        </main>
      </div>
    </>
  );
}