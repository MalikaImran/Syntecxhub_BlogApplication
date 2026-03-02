import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.auth-root {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: 'DM Sans', sans-serif;
}
.auth-root * { box-sizing: border-box; margin: 0; padding: 0; }

/* ── LEFT PANEL ─────────────────────────────────────────────── */
.auth-left {
  background: linear-gradient(145deg, #0B1F3A 0%, #112D4E 50%, #0D2137 100%);
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 3rem;
}
.auth-left::before {
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 80% 20%, rgba(66,165,245,0.15), transparent),
    radial-gradient(ellipse 40% 60% at 10% 80%, rgba(21,101,192,0.2), transparent);
  pointer-events: none;
}

/* Floating geometric shapes */
.geo {
  position: absolute; border-radius: 50%;
  background: rgba(66,165,245,0.07);
  border: 1px solid rgba(144,202,249,0.1);
  animation: floatGeo 8s ease-in-out infinite;
}
.geo1 { width:300px; height:300px; top:-80px; right:-80px; animation-delay:0s; }
.geo2 { width:180px; height:180px; bottom:120px; left:-60px; animation-delay:-3s; }
.geo3 { width:100px; height:100px; top:45%; right:8%; animation-delay:-5s; }
@keyframes floatGeo {
  0%,100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-20px) rotate(5deg); }
}

/* Grid dots pattern */
.auth-left::after {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(144,202,249,0.12) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
}

.auth-left-inner { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; justify-content: center; }

.auth-logo { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 4rem; }
.auth-logo-icon {
  width: 42px; height: 42px; border-radius: 12px;
  background: linear-gradient(135deg, #1565C0, #42A5F5);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; box-shadow: 0 6px 20px rgba(21,101,192,0.4);
}
.auth-logo-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem; font-weight: 800; color: white;
}
.auth-logo-text span { color: #42A5F5; }

.auth-left-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 3.5vw, 2.8rem);
  font-weight: 900; color: white; line-height: 1.2;
  margin-bottom: 1.25rem;
}
.auth-left-title em { color: #42A5F5; font-style: italic; display: block; }

.auth-left-sub {
  font-size: 1rem; color: rgba(144,202,249,0.65);
  line-height: 1.75; font-weight: 300; max-width: 360px;
  margin-bottom: 3rem;
}

/* Testimonial card */
.auth-quote {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(144,202,249,0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px; padding: 1.5rem;
  max-width: 380px;
}
.auth-quote-text {
  font-size: 0.9rem; color: rgba(255,255,255,0.8);
  line-height: 1.7; font-style: italic; margin-bottom: 1rem;
}
.auth-quote-author { display: flex; align-items: center; gap: 0.75rem; }
.auth-quote-avatar {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #1565C0, #42A5F5);
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 800; font-size: 0.85rem;
}
.auth-quote-name { font-size: 0.82rem; font-weight: 700; color: white; }
.auth-quote-role { font-size: 0.72rem; color: rgba(144,202,249,0.5); }

/* Feature pills */
.auth-features { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-top: 2.5rem; }
.auth-feat-pill {
  display: flex; align-items: center; gap: 0.4rem;
  background: rgba(66,165,245,0.1); border: 1px solid rgba(144,202,249,0.2);
  color: #90CAF9; font-size: 0.75rem; font-weight: 600;
  padding: 0.35rem 0.85rem; border-radius: 20px;
}

/* ── RIGHT PANEL ────────────────────────────────────────────── */
.auth-right {
  background: #F7FAFD;
  display: flex; align-items: center; justify-content: center;
  padding: 3rem 2rem;
}
.auth-form-wrap {
  width: 100%; max-width: 420px;
  animation: slideIn 0.5s ease both;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}

.auth-form-header { margin-bottom: 2.25rem; }
.auth-form-eyebrow {
  font-size: 0.72rem; font-weight: 800; letter-spacing: 2px;
  text-transform: uppercase; color: #1565C0; margin-bottom: 0.6rem;
}
.auth-form-title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem; font-weight: 800; color: #0B1F3A; line-height: 1.2;
  margin-bottom: 0.5rem;
}
.auth-form-sub { font-size: 0.88rem; color: #546E7A; }

/* Form fields */
.form-group { margin-bottom: 1.1rem; }
.form-label {
  display: block; font-size: 0.8rem; font-weight: 700;
  color: #0B1F3A; margin-bottom: 0.45rem; letter-spacing: 0.3px;
}
.form-input-wrap {
  position: relative; display: flex; align-items: center;
}
.form-input-icon {
  position: absolute; left: 1rem; font-size: 1rem;
  pointer-events: none; z-index: 1;
}
.form-input {
  width: 100%; padding: 0.85rem 1rem 0.85rem 2.75rem;
  background: white; border: 2px solid #E3F2FD;
  border-radius: 12px; font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem; color: #0B1F3A; outline: none;
  transition: all 0.2s; box-shadow: 0 1px 4px rgba(11,31,58,0.04);
}
.form-input:focus {
  border-color: #42A5F5;
  box-shadow: 0 0 0 4px rgba(66,165,245,0.12);
}
.form-input::placeholder { color: #aaa; font-weight: 400; }
.form-input.error { border-color: #FF5252; box-shadow: 0 0 0 4px rgba(255,82,82,0.1); }

/* Password toggle */
.pw-toggle {
  position: absolute; right: 1rem; background: none; border: none;
  cursor: pointer; font-size: 1rem; color: #aaa; padding: 0;
  transition: color 0.2s;
}
.pw-toggle:hover { color: #1565C0; }

/* Submit btn */
.auth-submit {
  width: 100%; padding: 1rem;
  background: linear-gradient(135deg, #0B1F3A, #1565C0);
  color: white; border: none; border-radius: 12px;
  font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700;
  cursor: pointer; margin-top: 0.75rem;
  transition: all 0.25s; position: relative; overflow: hidden;
  box-shadow: 0 6px 20px rgba(11,31,58,0.3);
}
.auth-submit::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
  opacity: 0; transition: opacity 0.2s;
}
.auth-submit:hover::after { opacity: 1; }
.auth-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(11,31,58,0.35); }
.auth-submit:disabled { background: #aaa; box-shadow: none; transform: none; cursor: not-allowed; }

/* Loading spinner */
.auth-spinner {
  display: inline-block; width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
  border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 0.5rem;
  vertical-align: middle;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Divider */
.auth-divider {
  display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0;
}
.auth-divider::before, .auth-divider::after {
  content: ''; flex: 1; height: 1px; background: #E3F2FD;
}
.auth-divider span { font-size: 0.75rem; color: #aaa; font-weight: 600; }

/* Switch link */
.auth-switch {
  text-align: center; font-size: 0.88rem; color: #546E7A;
  margin-top: 1.5rem;
}
.auth-switch a { color: #1565C0; font-weight: 700; text-decoration: none; }
.auth-switch a:hover { text-decoration: underline; }

/* Responsive */
@media (max-width: 768px) {
  .auth-root { grid-template-columns: 1fr; }
  .auth-left { display: none; }
  .auth-right { padding: 2rem 1.5rem; align-items: flex-start; padding-top: 3rem; }
}
`;

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data);
      toast.success(`Welcome back, ${data.name}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{css}</style>
      <div className="auth-root">

        {/* ── LEFT ─────────────────────────────── */}
        <div className="auth-left">
          <div className="geo geo1" /><div className="geo geo2" /><div className="geo geo3" />

          <div className="auth-logo">
            <div className="auth-logo-icon">📝</div>
            <div className="auth-logo-text">Blog<span>App</span></div>
          </div>

          <div className="auth-left-inner">
            <h2 className="auth-left-title">
              Welcome back to your
              <em>creative space.</em>
            </h2>
            <p className="auth-left-sub">
              Your stories, ideas and perspectives are waiting. Sign in and continue where you left off.
            </p>

            <div className="auth-quote">
              <p className="auth-quote-text">
                "Writing is the painting of the voice — and this platform gives me the canvas I need."
              </p>
              <div className="auth-quote-author">
                <div className="auth-quote-avatar">A</div>
                <div>
                  <div className="auth-quote-name">Ali Hassan</div>
                  <div className="auth-quote-role">Tech Blogger · 42 posts</div>
                </div>
              </div>
            </div>

            <div className="auth-features">
              {['✍️ Rich Editor','🖼 Image Upload','🎥 Video Support','❤️ Like & Comment'].map(f => (
                <span key={f} className="auth-feat-pill">{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT ────────────────────────────── */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <div className="auth-form-eyebrow">Welcome Back</div>
              <h1 className="auth-form-title">Sign in to<br />your account</h1>
              <p className="auth-form-sub">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="form-input-wrap">
                  <span className="form-input-icon">✉️</span>
                  <input
                    className="form-input"
                    type="email" name="email"
                    placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                    required autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="form-input-wrap">
                  <span className="form-input-icon">🔒</span>
                  <input
                    className="form-input"
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={form.password} onChange={handleChange}
                    required
                    style={{paddingRight:'3rem'}}
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <><span className="auth-spinner" />Signing in...</>
                ) : (
                  '→ Sign In'
                )}
              </button>
            </form>

            <div className="auth-divider"><span>or</span></div>

            <div className="auth-switch">
              Don't have an account?{' '}
              <Link to="/register">Create one free →</Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}