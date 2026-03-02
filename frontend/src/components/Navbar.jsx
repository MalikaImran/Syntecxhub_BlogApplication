import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 2rem', height: '64px', background: '#1a1a2e',
      color: 'white', position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
    }}>
      <Link to="/" style={{
        color: 'white', fontSize: '1.4rem', fontWeight: '800',
        letterSpacing: '-0.5px'
      }}>
        📝 BlogApp
      </Link>

      <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#ccc', fontSize: '0.95rem' }}>Home</Link>

        {user ? (
          <>
            <Link to="/dashboard" style={{ color: '#ccc', fontSize: '0.95rem' }}>
              Dashboard
            </Link>
            <Link to="/create" style={{
              background: '#3498db', color: 'white', padding: '0.4rem 1rem',
              borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600'
            }}>
              + Write
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" style={{ color: '#ffd700', fontSize: '0.9rem', fontWeight: '600' }}>
                ⚙️ Admin
              </Link>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {user.avatar && (
                <img src={user.avatar} alt="" style={{
                  width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover',
                  border: '2px solid #3498db'
                }} />
              )}
              <span style={{ color: '#ccc', fontSize: '0.85rem' }}>{user.name}</span>
            </div>
            <button onClick={handleLogout} style={{
              background: '#e74c3c', color: 'white', border: 'none',
              padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: '600'
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#ccc', fontSize: '0.95rem' }}>Login</Link>
            <Link to="/register" style={{
              background: '#2ecc71', color: 'white', padding: '0.4rem 1rem',
              borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600'
            }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
