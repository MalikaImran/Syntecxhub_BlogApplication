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
  background: linear-gradient(145deg, #0B1F3A 0%, #0D2B4E 50%, #0A2240 100%);
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 3rem;
}
.auth-left::before {
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 70% 50% at 90% 10%, rgba(0,200,151,0.1), transparent),
    radial-gradient(ellipse 50% 60% at 5% 90%, rgba(21,101,192,0.2), transparent),
    radial-gradient(ellipse 40% 40% at 50% 50%, rgba(66,165,245,0.07), transparent);
  pointer-events: none;
}
.auth-left::after {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(144,202,249,0.1) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
}

/* Animated shapes */
.shape {
  position: absolute;
  border: 1px solid rgba(144,202,249,0.12);
  animation: morphFloat 10s ease-in-out infinite;
}
.shape1 { width:280px; height:280px; border-radius:40% 60% 70% 30%/40% 50% 60% 50%; top:-60px; right:-60px; animation-delay:0s; background:rgba(66,165,245,0.05); }
.shape2 { width:160px; height:160px; border-radius:60% 40% 30% 70%/60% 30% 70% 40%; bottom:80px; left:-40px; animation-delay:-4s; background:rgba(0,200,151,0.04); }
.shape3 { width:80px; height:80px; border-radius:50%; top:40%; right:12%; animation-delay:-7s; background:rgba(144,202,249,0.06); }
@keyframes morphFloat {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  33%     { transform: translate(8px,-12px) rotate(3deg); }
  66%     { transform: translate(-5px,8px) rotate(-2deg); }
}

.auth-left-inner { position: relative; z-index: 2; flex:1; display:flex; flex-direction:column; justify-content:center; }

.auth-logo { display:flex; align-items:center; gap:0.6rem; margin-bottom:3.5rem; }
.auth-logo-icon {
  width:42px; height:42px; border-radius:12px;
  background: linear-gradient(135deg, #1565C0, #42A5F5);
  display:flex; align-items:center; justify-content:center;
  font-size:1.2rem; box-shadow:0 6px 20px rgba(21,101,192,0.4);
}
.auth-logo-text {
  font-family:'Playfair Display',serif;
  font-size:1.4rem; font-weight:800; color:white;
}
.auth-logo-text span { color:#42A5F5; }

.auth-left-title {
  font-family:'Playfair Display',serif;
  font-size:clamp(1.8rem,3vw,2.6rem);
  font-weight:900; color:white; line-height:1.2; margin-bottom:1.25rem;
}
.auth-left-title em { color:#42A5F5; font-style:italic; }

.auth-left-sub {
  font-size:0.95rem; color:rgba(144,202,249,0.6);
  line-height:1.75; font-weight:300; max-width:360px; margin-bottom:2.5rem;
}

/* Steps list */
.auth-steps { display:flex; flex-direction:column; gap:1rem; }
.auth-step {
  display:flex; align-items:flex-start; gap:1rem;
  animation: stepIn 0.6s ease both;
}
.auth-step:nth-child(1){animation-delay:0.1s}
.auth-step:nth-child(2){animation-delay:0.2s}
.auth-step:nth-child(3){animation-delay:0.3s}
@keyframes stepIn {
  from{opacity:0;transform:translateX(-12px)}
  to{opacity:1;transform:translateX(0)}
}
.step-num {
  width:32px; height:32px; border-radius:10px; flex-shrink:0;
  background:rgba(66,165,245,0.15); border:1px solid rgba(144,202,249,0.2);
  display:flex; align-items:center; justify-content:center;
  font-size:0.85rem; font-weight:800; color:#42A5F5;
}
.step-text { padding-top:4px; }
.step-title { font-size:0.88rem; font-weight:700; color:white; margin-bottom:2px; }
.step-sub   { font-size:0.75rem; color:rgba(144,202,249,0.5); }

/* ── RIGHT PANEL ────────────────────────────────────────────── */
.auth-right {
  background:#F7FAFD;
  display:flex; align-items:center; justify-content:center;
  padding:2.5rem 2rem; overflow-y:auto;
}
.auth-form-wrap {
  width:100%; max-width:440px;
  animation:slideIn 0.5s ease both;
}
@keyframes slideIn {
  from{opacity:0;transform:translateX(20px)}
  to{opacity:1;transform:translateX(0)}
}

.auth-form-header { margin-bottom:2rem; }
.auth-form-eyebrow {
  font-size:0.72rem; font-weight:800; letter-spacing:2px;
  text-transform:uppercase; color:#00C897; margin-bottom:0.6rem;
}
.auth-form-title {
  font-family:'Playfair Display',serif;
  font-size:2rem; font-weight:800; color:#0B1F3A; line-height:1.2; margin-bottom:0.5rem;
}
.auth-form-sub { font-size:0.88rem; color:#546E7A; }

/* Form fields */
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.form-group { margin-bottom:1rem; }
.form-label {
  display:block; font-size:0.8rem; font-weight:700;
  color:#0B1F3A; margin-bottom:0.4rem; letter-spacing:0.3px;
}
.form-input-wrap { position:relative; display:flex; align-items:center; }
.form-input-icon {
  position:absolute; left:0.9rem; font-size:0.95rem;
  pointer-events:none; z-index:1;
}
.form-input {
  width:100%; padding:0.8rem 1rem 0.8rem 2.6rem;
  background:white; border:2px solid #E3F2FD; border-radius:12px;
  font-family:'DM Sans',sans-serif; font-size:0.92rem; color:#0B1F3A;
  outline:none; transition:all 0.2s; box-shadow:0 1px 4px rgba(11,31,58,0.04);
}
.form-input:focus {
  border-color:#42A5F5;
  box-shadow:0 0 0 4px rgba(66,165,245,0.12);
}
.form-input::placeholder { color:#bbb; font-weight:400; }

/* Password strength */
.pw-strength { margin-top:0.4rem; }
.pw-bars { display:flex; gap:3px; height:3px; margin-bottom:3px; }
.pw-bar {
  flex:1; border-radius:2px; background:#E3F2FD;
  transition:background 0.3s;
}
.pw-bar.weak   { background:#FF5252; }
.pw-bar.fair   { background:#FFB300; }
.pw-bar.good   { background:#42A5F5; }
.pw-bar.strong { background:#00C897; }
.pw-label { font-size:0.7rem; color:#aaa; font-weight:600; }

/* Show/hide pw */
.pw-toggle {
  position:absolute; right:0.9rem; background:none; border:none;
  cursor:pointer; font-size:0.95rem; color:#aaa; padding:0; transition:color 0.2s;
}
.pw-toggle:hover { color:#1565C0; }

/* Terms */
.auth-terms {
  display:flex; align-items:flex-start; gap:0.7rem;
  background:#F0F8FF; border-radius:10px; padding:0.85rem; margin-bottom:1rem;
}
.auth-terms input { width:16px; height:16px; margin-top:1px; cursor:pointer; flex-shrink:0; accent-color:#1565C0; }
.auth-terms label { font-size:0.8rem; color:#546E7A; line-height:1.5; cursor:pointer; }
.auth-terms a { color:#1565C0; font-weight:700; text-decoration:none; }

/* Submit */
.auth-submit {
  width:100%; padding:1rem;
  background:linear-gradient(135deg, #0B1F3A, #1565C0);
  color:white; border:none; border-radius:12px;
  font-family:'DM Sans',sans-serif; font-size:1rem; font-weight:700;
  cursor:pointer; transition:all 0.25s; position:relative; overflow:hidden;
  box-shadow:0 6px 20px rgba(11,31,58,0.28);
}
.auth-submit:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(11,31,58,0.35); }
.auth-submit:disabled { background:#aaa; box-shadow:none; transform:none; cursor:not-allowed; }

.auth-spinner {
  display:inline-block; width:15px; height:15px;
  border:2px solid rgba(255,255,255,0.3); border-top-color:white;
  border-radius:50%; animation:spin 0.7s linear infinite;
  margin-right:0.5rem; vertical-align:middle;
}
@keyframes spin { to{transform:rotate(360deg)} }

.auth-switch {
  text-align:center; font-size:0.88rem; color:#546E7A; margin-top:1.25rem;
}
.auth-switch a { color:#1565C0; font-weight:700; text-decoration:none; }
.auth-switch a:hover { text-decoration:underline; }

@media(max-width:768px){
  .auth-root{grid-template-columns:1fr;}
  .auth-left{display:none;}
  .auth-right{padding:2rem 1.5rem;align-items:flex-start;padding-top:3rem;}
  .form-row{grid-template-columns:1fr;}
}
`;

function getStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6)  s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9!@#$%]/.test(pw)) s++;
  return Math.min(s, 4);
}
const strengthLabels = ['','Weak','Fair','Good','Strong'];
const strengthClass  = ['','weak','fair','good','strong'];

export default function Register() {
  const [form, setForm]       = useState({ name:'', email:'', password:'' });
  const [showPw, setShowPw]   = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const strength = getStrength(form.password);

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!agreed) return toast.error('Please agree to the terms');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{css}</style>
      <div className="auth-root">

        {/* ── LEFT ─────────────────────────────── */}
        <div className="auth-left">
          <div className="shape shape1"/><div className="shape shape2"/><div className="shape shape3"/>

          <div className="auth-logo">
            <div className="auth-logo-icon">📝</div>
            <div className="auth-logo-text">Blog<span>App</span></div>
          </div>

          <div className="auth-left-inner">
            <h2 className="auth-left-title">
              Join thousands of <em>writers & readers.</em>
            </h2>
            <p className="auth-left-sub">
              Create your free account in seconds and start sharing your ideas with the world today.
            </p>

            <div className="auth-steps">
              {[
                { n:'01', title:'Create your account',    sub:'Fill in the form — takes 30 seconds' },
                { n:'02', title:'Write your first blog',  sub:'Rich editor, image & video support' },
                { n:'03', title:'Grow your audience',     sub:'Likes, comments & sharing built in' },
              ].map(s => (
                <div key={s.n} className="auth-step">
                  <div className="step-num">{s.n}</div>
                  <div className="step-text">
                    <div className="step-title">{s.title}</div>
                    <div className="step-sub">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT ────────────────────────────── */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <div className="auth-form-eyebrow">Get Started Free</div>
              <h1 className="auth-form-title">Create your<br />account</h1>
              <p className="auth-form-sub">Start writing and sharing your stories</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="form-input-wrap">
                  <span className="form-input-icon">👤</span>
                  <input
                    className="form-input"
                    type="text" name="name"
                    placeholder="Your full name"
                    value={form.name} onChange={handleChange}
                    required autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="form-input-wrap">
                  <span className="form-input-icon">✉️</span>
                  <input
                    className="form-input"
                    type="email" name="email"
                    placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                    required
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
                    placeholder="Min. 6 characters"
                    value={form.password} onChange={handleChange}
                    required
                    style={{paddingRight:'3rem'}}
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
                {form.password && (
                  <div className="pw-strength">
                    <div className="pw-bars">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`pw-bar ${i <= strength ? strengthClass[strength] : ''}`} />
                      ))}
                    </div>
                    <span className="pw-label">{strengthLabels[strength]} password</span>
                  </div>
                )}
              </div>

              <div className="auth-terms">
                <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                <label htmlFor="terms">
                  I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>. I understand my data will be stored securely.
                </label>
              </div>

              <button type="submit" className="auth-submit" disabled={loading || !agreed}>
                {loading
                  ? <><span className="auth-spinner"/>Creating account...</>
                  : '→ Create Free Account'
                }
              </button>
            </form>

            <div className="auth-switch">
              Already have an account?{' '}
              <Link to="/login">Sign in →</Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}