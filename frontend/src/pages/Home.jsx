import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const CATEGORIES = ['All','Technology','Lifestyle','Travel','Food','Health','Business','Other'];

const CATEGORY_CONFIG = {
  Technology: { emoji:'💻', color:'#1565C0', bg:'#E3F2FD' },
  Lifestyle:  { emoji:'✨', color:'#6A1B9A', bg:'#F3E5F5' },
  Travel:     { emoji:'🌍', color:'#00695C', bg:'#E0F2F1' },
  Food:       { emoji:'🍜', color:'#E65100', bg:'#FFF3E0' },
  Health:     { emoji:'💪', color:'#2E7D32', bg:'#E8F5E9' },
  Business:   { emoji:'📈', color:'#1565C0', bg:'#E8EAF6' },
  Other:      { emoji:'📌', color:'#546E7A', bg:'#ECEFF1' },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --navy:    #0B1F3A;
  --navyMid: #112D4E;
  --blue:    #1565C0;
  --sky:     #42A5F5;
  --skyLt:   #90CAF9;
  --ice:     #E3F2FD;
  --icePale: #F0F8FF;
  --white:   #FFFFFF;
  --slate:   #546E7A;
  --bg:      #F7FAFD;
}

.hp-root { font-family: 'DM Sans', sans-serif; background: var(--bg); min-height: 100vh; }
.hp-root * { box-sizing: border-box; margin: 0; padding: 0; }

/* ── HERO ───────────────────────────────────────────────────── */
.hero {
  background: linear-gradient(135deg, var(--navy) 0%, var(--navyMid) 55%, #1A3D5C 100%);
  padding: 5rem 2rem 4rem;
  position: relative; overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 60% at 70% 50%, rgba(66,165,245,0.12), transparent),
              radial-gradient(ellipse 40% 40% at 20% 80%, rgba(21,101,192,0.18), transparent);
  pointer-events: none;
}
.hero-grid {
  max-width: 1180px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;
  position: relative; z-index: 1;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: rgba(66,165,245,0.15); border: 1px solid rgba(144,202,249,0.3);
  color: var(--skyLt); font-size: 0.75rem; font-weight: 600;
  padding: 0.35rem 0.9rem; border-radius: 20px; letter-spacing: 1.5px;
  text-transform: uppercase; margin-bottom: 1.5rem;
}
.hero-eyebrow span { width: 6px; height: 6px; border-radius: 50%; background: var(--sky); animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.4rem, 5vw, 3.8rem);
  font-weight: 900; line-height: 1.15;
  color: var(--white); margin-bottom: 1.25rem;
}
.hero-title em { color: var(--sky); font-style: italic; }
.hero-sub {
  font-size: 1.05rem; color: rgba(144,202,249,0.75);
  line-height: 1.7; margin-bottom: 2rem; font-weight: 300;
}
.hero-cta { display: flex; gap: 1rem; flex-wrap: wrap; }
.btn-hero-primary {
  padding: 0.85rem 2rem;
  background: linear-gradient(135deg, var(--blue), var(--sky));
  color: white; border: none; border-radius: 10px;
  font-size: 0.95rem; font-weight: 700; cursor: pointer;
  box-shadow: 0 6px 24px rgba(21,101,192,0.4);
  transition: all 0.25s; text-decoration: none; display: inline-block;
}
.btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(21,101,192,0.5); }
.btn-hero-ghost {
  padding: 0.85rem 2rem;
  background: transparent; color: var(--skyLt);
  border: 1.5px solid rgba(144,202,249,0.35); border-radius: 10px;
  font-size: 0.95rem; font-weight: 600; cursor: pointer;
  transition: all 0.25s; text-decoration: none; display: inline-block;
}
.btn-hero-ghost:hover { background: rgba(144,202,249,0.08); border-color: var(--skyLt); }

/* Hero stats */
.hero-stats {
  display: flex; gap: 2rem; margin-top: 2.5rem;
  padding-top: 2rem; border-top: 1px solid rgba(144,202,249,0.15);
}
.hero-stat-val {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem; font-weight: 900; color: white; line-height: 1;
}
.hero-stat-lbl { font-size: 0.75rem; color: rgba(144,202,249,0.6); margin-top: 3px; letter-spacing: 0.5px; }

/* Hero featured card */
.hero-featured {
  position: relative;
}
.hero-card-float {
  background: white; border-radius: 20px; overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.35);
  transform: rotate(1.5deg);
  transition: transform 0.4s ease;
}
.hero-card-float:hover { transform: rotate(0deg) scale(1.02); }
.hero-card-img {
  width: 100%; height: 220px; object-fit: cover;
  background: linear-gradient(135deg, var(--ice), var(--skyLt));
  display: flex; align-items: center; justify-content: center;
  font-size: 4rem;
}
.hero-card-body { padding: 1.25rem 1.5rem 1.5rem; }
.hero-card-cat {
  font-size: 0.7rem; font-weight: 800; letter-spacing: 1.5px;
  text-transform: uppercase; color: var(--blue); margin-bottom: 0.5rem;
}
.hero-card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem; font-weight: 700; color: var(--navy); line-height: 1.4;
  margin-bottom: 0.75rem;
}
.hero-card-meta { display: flex; gap: 1rem; font-size: 0.78rem; color: var(--slate); }

/* Floating badge */
.hero-badge {
  position: absolute; top: -14px; right: -10px;
  background: linear-gradient(135deg,#FF6B35,#FF8C42);
  color: white; padding: 0.5rem 1rem; border-radius: 20px;
  font-size: 0.72rem; font-weight: 800; letter-spacing: 0.5px;
  box-shadow: 0 4px 14px rgba(255,107,53,0.5);
}

/* ── SEARCH BAR ─────────────────────────────────────────────── */
.search-wrap {
  max-width: 1180px; margin: -2rem auto 0; padding: 0 2rem;
  position: relative; z-index: 10;
}
.search-bar {
  background: white; border-radius: 16px;
  box-shadow: 0 8px 40px rgba(11,31,58,0.14);
  padding: 1.25rem 1.5rem;
  display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;
  border: 1px solid rgba(144,202,249,0.2);
}
.search-input-wrap {
  flex: 1; min-width: 220px;
  display: flex; align-items: center; gap: 0.6rem;
  background: var(--icePale); border-radius: 10px;
  padding: 0.6rem 1rem; border: 1.5px solid var(--ice);
  transition: border-color 0.2s;
}
.search-input-wrap:focus-within { border-color: var(--sky); }
.search-input-wrap span { font-size: 1rem; flex-shrink: 0; }
.search-input-wrap input {
  border: none; background: transparent; outline: none;
  font-family: 'DM Sans', sans-serif; font-size: 0.92rem;
  color: var(--navy); width: 100%;
}
.search-input-wrap input::placeholder { color: #aaa; }
.search-select {
  padding: 0.65rem 1rem; background: var(--icePale);
  border: 1.5px solid var(--ice); border-radius: 10px;
  font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
  color: var(--navy); outline: none; cursor: pointer;
  transition: border-color 0.2s;
}
.search-select:focus { border-color: var(--sky); }
.search-count {
  font-size: 0.82rem; color: var(--slate); font-weight: 500; white-space: nowrap;
}

/* ── CATEGORY PILLS ─────────────────────────────────────────── */
.cat-strip {
  max-width: 1180px; margin: 2rem auto 0; padding: 0 2rem;
  display: flex; gap: 0.5rem; flex-wrap: wrap;
}
.cat-pill {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.4rem 1rem; border-radius: 20px;
  font-size: 0.82rem; font-weight: 600; cursor: pointer;
  border: 2px solid transparent; transition: all 0.2s;
  background: white; color: var(--slate);
  box-shadow: 0 1px 4px rgba(11,31,58,0.06);
}
.cat-pill.active {
  background: var(--navy); color: white; border-color: var(--navy);
  box-shadow: 0 4px 12px rgba(11,31,58,0.2);
}
.cat-pill:not(.active):hover {
  border-color: var(--sky); color: var(--blue); background: var(--icePale);
}
.cat-pill .emoji { font-size: 0.9rem; }

/* ── BLOG GRID ──────────────────────────────────────────────── */
.blogs-section { max-width: 1180px; margin: 2.5rem auto; padding: 0 2rem 4rem; }

.section-header {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 1.75rem;
}
.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem; font-weight: 800; color: var(--navy);
}
.section-sub { font-size: 0.85rem; color: var(--slate); }

/* Featured row: first blog big, rest small */
.blogs-featured { display: grid; grid-template-columns: 1.6fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
.blogs-grid     { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }

/* Card base */
.blog-card {
  background: white; border-radius: 18px; overflow: hidden;
  border: 1px solid rgba(144,202,249,0.18);
  box-shadow: 0 2px 12px rgba(11,31,58,0.06);
  transition: transform 0.25s, box-shadow 0.25s;
  cursor: pointer; text-decoration: none; display: block;
  animation: fadeUp 0.5s ease both;
}
@keyframes fadeUp {
  from { opacity:0; transform: translateY(18px); }
  to   { opacity:1; transform: translateY(0); }
}
.blog-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(11,31,58,0.13);
}

/* Big featured card */
.blog-card.featured .card-img  { height: 300px; }
.blog-card.featured .card-title { font-size: 1.45rem; }

/* Regular card */
.card-img {
  width: 100%; height: 200px; object-fit: cover;
  background: linear-gradient(135deg, var(--ice), var(--skyLt));
  display: flex; align-items: center; justify-content: center;
  font-size: 3.5rem; position: relative; overflow: hidden;
}
.card-img img { width:100%; height:100%; object-fit:cover; }
.card-img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(11,31,58,0.5) 0%, transparent 60%);
}
.card-media-badge {
  position: absolute; top: 10px; right: 10px;
  background: rgba(0,0,0,0.55); color: white;
  font-size: 0.72rem; font-weight: 700; padding: 3px 9px;
  border-radius: 20px; backdrop-filter: blur(4px);
}

.card-body { padding: 1.25rem 1.4rem 1.4rem; }
.card-top  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; }
.card-cat  {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: 0.7rem; font-weight: 800; padding: 3px 9px;
  border-radius: 8px; letter-spacing: 0.5px; text-transform: uppercase;
}
.card-status-pill {
  font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 10px;
}
.card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem; font-weight: 700; color: var(--navy);
  line-height: 1.4; margin-bottom: 0.6rem;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.card-excerpt {
  font-size: 0.85rem; color: var(--slate); line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  margin-bottom: 1rem;
}
.card-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 0.9rem; border-top: 1px solid #F0F7FF;
  font-size: 0.77rem; color: #aaa;
}
.card-author { display: flex; align-items: center; gap: 0.45rem; }
.card-avatar {
  width: 24px; height: 24px; border-radius: 6px; object-fit: cover;
  background: linear-gradient(135deg, var(--blue), var(--sky));
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 0.65rem; font-weight: 800;
}
.card-meta-right { display: flex; gap: 0.75rem; }

/* ── EMPTY + LOADING ────────────────────────────────────────── */
.empty-state {
  text-align: center; padding: 5rem 2rem; color: var(--slate);
  grid-column: 1 / -1;
}
.empty-icon { font-size: 3.5rem; margin-bottom: 1rem; opacity: 0.4; }
.skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.skeleton-card {
  background: white; border-radius: 18px; overflow: hidden;
  border: 1px solid rgba(144,202,249,0.18);
}

/* ── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-featured { display: none; }
  .blogs-featured { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .hero { padding: 3rem 1.5rem 3rem; }
  .hero-title { font-size: 2rem; }
  .search-bar { flex-direction: column; }
  .search-input-wrap { width: 100%; }
}
`;

/* ── SKELETON CARD ──────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton" style={{height:'200px', borderRadius:0}} />
      <div style={{padding:'1.25rem'}}>
        <div className="skeleton" style={{height:'12px', width:'30%', marginBottom:'10px'}} />
        <div className="skeleton" style={{height:'18px', width:'90%', marginBottom:'6px'}} />
        <div className="skeleton" style={{height:'18px', width:'70%', marginBottom:'12px'}} />
        <div className="skeleton" style={{height:'12px', width:'50%'}} />
      </div>
    </div>
  );
}

/* ── BLOG CARD ──────────────────────────────────────────────── */
function BlogCard({ blog, featured = false, index = 0 }) {
  const cfg = CATEGORY_CONFIG[blog.category] || CATEGORY_CONFIG.Other;
  const initials = blog.author?.name?.[0]?.toUpperCase() || 'U';

  return (
    <Link
      to={`/blog/${blog._id}`}
      className={`blog-card ${featured ? 'featured' : ''}`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="card-img">
        {blog.featuredImage ? (
          <>
            <img src={blog.featuredImage} alt={blog.title} />
            <div className="card-img-overlay" />
          </>
        ) : blog.featuredVideo ? (
          <>
            <span>🎥</span>
            <div className="card-media-badge">🎥 Video</div>
          </>
        ) : (
          <span>{cfg.emoji}</span>
        )}
        {blog.featuredVideo && blog.featuredImage && (
          <div className="card-media-badge">🎥 Video</div>
        )}
      </div>

      <div className="card-body">
        <div className="card-top">
          <span className="card-cat" style={{ background: cfg.bg, color: cfg.color }}>
            <span>{cfg.emoji}</span> {blog.category}
          </span>
        </div>

        <div className="card-title">{blog.title}</div>
        <div className="card-excerpt">{blog.excerpt}</div>

        <div className="card-footer">
          <div className="card-author">
            {blog.author?.avatar
              ? <img src={blog.author.avatar} alt="" className="card-avatar" style={{borderRadius:'6px'}} />
              : <div className="card-avatar">{initials}</div>
            }
            <span style={{fontWeight:'600', color:'#555'}}>{blog.author?.name}</span>
          </div>
          <div className="card-meta-right">
            <span>⏱ {blog.readTime}m</span>
            <span>❤️ {blog.likes?.length || 0}</span>
            <span>{new Date(blog.createdAt).toLocaleDateString('en-PK',{day:'numeric',month:'short'})}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── HERO PREVIEW CARD ──────────────────────────────────────── */
function HeroCard({ blog }) {
  if (!blog) return (
    <div className="hero-featured">
      <div className="hero-card-float">
        <div className="hero-card-img"><span>✍️</span></div>
        <div className="hero-card-body">
          <div className="hero-card-cat">Latest Post</div>
          <div className="hero-card-title">Your first blog post will appear here</div>
          <div className="hero-card-meta"><span>Start writing today</span></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="hero-featured">
      <div className="hero-badge">✦ Latest</div>
      <Link to={`/blog/${blog._id}`} className="hero-card-float" style={{textDecoration:'none'}}>
        <div className="hero-card-img">
          {blog.featuredImage
            ? <img src={blog.featuredImage} alt={blog.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
            : <span>{CATEGORY_CONFIG[blog.category]?.emoji || '📝'}</span>
          }
        </div>
        <div className="hero-card-body">
          <div className="hero-card-cat">{blog.category}</div>
          <div className="hero-card-title">{blog.title}</div>
          <div className="hero-card-meta">
            <span>✍️ {blog.author?.name}</span>
            <span>⏱ {blog.readTime} min read</span>
            <span>❤️ {blog.likes?.length || 0}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ── MAIN HOME COMPONENT ────────────────────────────────────── */
export default function Home() {
  const [blogs, setBlogs]       = useState([]);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort]         = useState('newest');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search)   params.search   = search;
        if (category) params.category = category;
        params.sort = sort;
        const { data } = await API.get('/blogs', { params });
        setBlogs(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    const t = setTimeout(fetchBlogs, 350);
    return () => clearTimeout(t);
  }, [search, category, sort]);

  const latestBlog  = blogs[0] || null;
  const restBlogs   = blogs.slice(1);
  const isFiltering = search || category;

  return (
    <>
      <style>{css}</style>
      <div className="hp-root">

        {/* ── HERO ──────────────────────────────────── */}
        {!isFiltering && (
          <section className="hero">
            <div className="hero-grid">
              <div>
                <div className="hero-eyebrow">
                  <span /> Blog Platform
                </div>
                <h1 className="hero-title">
                  Stories Worth<br /><em>Reading.</em>
                </h1>
                <p className="hero-sub">
                  Discover ideas, knowledge and perspectives from writers around the world.
                  Tech, travel, lifestyle & more — all in one place.
                </p>
                <div className="hero-cta">
                  <Link to="/create" className="btn-hero-primary">✦ Start Writing</Link>
                  <a href="#blogs" className="btn-hero-ghost">Explore Posts ↓</a>
                </div>
                <div className="hero-stats">
                  {[
                    { val: blogs.length || '—', lbl: 'Published Posts' },
                    { val: '8',                 lbl: 'Categories' },
                    { val: '∞',                 lbl: 'Stories to Tell' },
                  ].map((s,i) => (
                    <div key={i}>
                      <div className="hero-stat-val">{s.val}</div>
                      <div className="hero-stat-lbl">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
              <HeroCard blog={latestBlog} />
            </div>
          </section>
        )}

        {/* ── SEARCH BAR ──────────────────────────── */}
        <div className="search-wrap" id="blogs">
          <div className="search-bar">
            <div className="search-input-wrap">
              <span>🔍</span>
              <input
                placeholder="Search by title..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <span onClick={() => setSearch('')}
                  style={{cursor:'pointer', color:'#aaa', fontSize:'1rem', marginLeft:'auto'}}>✕</span>
              )}
            </div>
            <select className="search-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">🆕 Newest</option>
              <option value="oldest">📅 Oldest</option>
            </select>
            <span className="search-count">
              {loading ? '...' : `${blogs.length} post${blogs.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {/* ── CATEGORY PILLS ──────────────────────── */}
        <div className="cat-strip">
          {CATEGORIES.map(c => {
            const cfg = CATEGORY_CONFIG[c] || {};
            const val = c === 'All' ? '' : c;
            return (
              <button
                key={c}
                className={`cat-pill ${category === val ? 'active' : ''}`}
                onClick={() => setCategory(val)}
              >
                {cfg.emoji && <span className="emoji">{cfg.emoji}</span>}
                {c}
              </button>
            );
          })}
        </div>

        {/* ── BLOG GRID ───────────────────────────── */}
        <div className="blogs-section">
          <div className="section-header">
            <div>
              <div className="section-title">
                {isFiltering
                  ? search ? `Results for "${search}"` : `${category} Posts`
                  : 'Latest Stories'}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="blogs-grid">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : blogs.length === 0 ? (
            <div className="blogs-grid">
              <div className="empty-state">
                <div className="empty-icon">🔭</div>
                <p style={{fontSize:'1.1rem', fontWeight:'600', color:'#333', marginBottom:'0.5rem'}}>
                  No posts found
                </p>
                <p style={{fontSize:'0.88rem'}}>
                  Try a different search or category
                </p>
              </div>
            </div>
          ) : !isFiltering && blogs.length > 1 ? (
            <>
              {/* Featured layout — first post big */}
              <div className="blogs-featured">
                <BlogCard blog={blogs[0]} featured index={0} />
                <BlogCard blog={blogs[1]} index={1} />
              </div>
              {/* Rest in grid */}
              {blogs.length > 2 && (
                <div className="blogs-grid">
                  {blogs.slice(2).map((blog, i) => (
                    <BlogCard key={blog._id} blog={blog} index={i + 2} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="blogs-grid">
              {blogs.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} index={i} />
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}