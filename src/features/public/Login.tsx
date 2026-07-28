import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { isAdminSubdomain } from '@/utils/subdomain';
import { FcGoogle } from 'react-icons/fc';
import styles from './Login.module.css';

/**
 * Modern Platform Onboarding Hub.
 * Orchestrates high-fidelity authentication for Administrators, Merchants, and Users.
 * Dual-layout system: Admin (Split-Screen) | Users/Merchants (Centered Legacy Card).
 */
const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithGoogle, loginAdmin, convertToSeller } = useAuth();
  const isAdm = isAdminSubdomain();

  const [requestedRole] = useState<'buyer' | 'seller'>(location.state?.role || 'buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isMerchant = requestedRole === 'seller';

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin(email, password);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Governance Access Refused: Invalid Credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (role: 'buyer' | 'seller') => {
    setError('');
    setLoading(true);
    try {
      const authData = await loginWithGoogle(role);
      
      if (authData?.requiresConfirmation && authData.pendingUserData) {
        setPendingUid(authData.pendingUserData.uid);
        setShowConfirmation(true);
        return;
      }
      
      let redirectPath: string = ROUTES.USER_PROFILE;
      if (authData?.user?.role === 'admin') redirectPath = ROUTES.ADMIN_DASHBOARD;
      if (authData?.user?.role === 'seller') redirectPath = ROUTES.SELLER_DASHBOARD;
      
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Identity acquisition failed.');
    } finally {
      if (!showConfirmation) setLoading(false);
    }
  };

  const handleConfirmConversion = async () => {
    if (!pendingUid) return;
    setError('');
    setLoading(true);
    setShowConfirmation(false);
    try {
      await convertToSeller(pendingUid);
      navigate(ROUTES.SELLER_DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Identity conversion failed.');
      setLoading(false);
    }
  };

  // 1. High-Fidelity Administrative Portal (Split Layout)
  if (isAdm) {
    return (
      <div className={styles.page}>
        <div className={styles.splitLayout}>
          <section className={styles.heroPane}>
            <img 
            src="/pet_marketplace_onboarding_hero_1775159357209.png" 
            alt="AniSell Community" 
              className={styles.heroImage}
            />
            <div className={styles.heroOverlay} />
          </section>

          <main className={styles.formPane}>
            <div className={styles.authCard}>
              <header className={styles.header}>
                <div className={styles.brand}>
                  <img src="https://anisell.in/wp-content/uploads/2025/06/91-93450-29589-1.png" alt="AniSell" style={{ height: '40px' }} />
                </div>
                <h1 className={styles.title}>System Governance</h1>
                <p className={styles.subtitle}>Authorize administrative session to access system controls.</p>
              </header>

              {error && <div className={styles.errorBanner}>{error}</div>}

              <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className={styles.formField}>
                  <label>REGISTRY EMAIL</label>
                  <input type="email" placeholder="User ID" className={styles.input} value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className={styles.formField}>
                  <label>REGISTRY TOKEN</label>
                  <input type="password" placeholder="••••••••" className={styles.input} value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Validating Registry...' : 'Gain High-Level Access'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>

              <button
                className={styles.googleButton}
                onClick={() => handleGoogleAuth('buyer')}
                disabled={loading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                <FcGoogle size={22} />
                Sign in with Google
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 2. Legacy Marketplace Portal (Centered Card Layout)
  return (
    <div className={`${styles.page} ${styles.legacyPage} ${isMerchant ? styles.merchantPage : styles.userPage}`}>
      <div className={`${styles.legacyCard} ${isMerchant ? styles.merchantCard : styles.userCard}`}>
        <header className={styles.header}>
          <h1 className={styles.title} style={{ fontSize: '32px', marginBottom: '8px' }}>
            {isMerchant ? 'Merchant Portal' : 'User Portal'}
          </h1>
          <p className={styles.subtitle} style={{ fontSize: '14px', color: '#64748b' }}>
            {isMerchant ? 'Register as a platform Merchant' : 'User Login'}
          </p>
        </header>

        {error && <div className={styles.errorBanner} style={{ marginBottom: '20px' }}>{error}</div>}

        <button 
          className={styles.googleButton} 
          onClick={() => handleGoogleAuth(isMerchant ? 'seller' : 'buyer')}
          disabled={loading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}
        >
          <FcGoogle size={22} />
          {isMerchant ? 'Register Merchant with Google' : 'User Login with Google'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          Secured by Google Platform Identity Services
        </div>
      </div>

      {showConfirmation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '440px', padding: '32px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>Identity Transition</h2>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              We've identified your account as a **Pet Parent**. Would you like to transition to a **Verified Merchant** profile to manage your inventory and revenue?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowConfirmation(false); setLoading(false); }} style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Keep Personal</button>
              <button onClick={handleConfirmConversion} style={{ flex: 1, padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Upgrade Roles</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
