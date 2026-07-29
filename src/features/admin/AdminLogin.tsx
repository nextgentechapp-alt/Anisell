import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Access Denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: 20
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '40px 36px',
        width: '100%', maxWidth: 400, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 24, fontWeight: 800, color: '#fff'
          }}>A</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Admin Login</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>AniSell Governance Hub</p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', background: '#fef2f2', color: '#dc2626',
            borderRadius: 8, fontSize: 13, marginBottom: 16, border: '1px solid #fecaca'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Admin Email</label>
            <input
              type="email" required value={email} autoFocus
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@anisell.com"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db',
                fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db',
                fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: 8, border: 'none',
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
