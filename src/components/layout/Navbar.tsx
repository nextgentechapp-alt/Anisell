import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '@/services/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { ROUTES } from '@/constants/routes';
import type { User } from 'firebase/auth';

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribeAuth = auth?.onAuthStateChanged((user: User | null) => {
      setCurrentUser(user);
      if (!user) {
         setUserProfile(null);
      }
    });
    return () => unsubscribeAuth?.();
  }, []);

  // Sync with Firestore for real-time updates across components
  useEffect(() => {
    if (!currentUser || !db) return;
    
    // Using onSnapshot for real-time sync of profile picture and other info
    const unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    });

    return () => unsubscribeProfile();
  }, [currentUser]);

  // Derived profile imageURL
  const profileImage = userProfile?.photoURL || currentUser?.photoURL;
  const userInitial = (currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase();

  const isSellerRegisterPage = location.pathname === ROUTES.REGISTER;

  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.MARKETPLACE}?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(ROUTES.MARKETPLACE);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="nav-wrapper">
      <nav className="nav">
        <Link to="/">
          <img
            src="/anisell_logo.png"
            alt="AniSell Logo"
            className="logo"
          />
        </Link>

        {!isSellerRegisterPage && (
          <form className="search" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Search pets, breeds, accessories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button type="submit">Search</button>
          </form>
        )}

        {currentUser ? (
          // User is signed in - show profile
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div className="nav-profile-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="My Profile"
                  className="user-profile"
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0', background: '#fff' }}
                />
              ) : (
                <div 
                  className="user-initial-avatar"
                  style={{ 
                    width: '38px', height: '38px', borderRadius: '50%', background: '#2874f0', 
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '16px'
                  }}
                >
                  {userInitial}
                </div>
              )}
            </div>
          </Link>
        ) : (
          // User is not signed in - show login button
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="login-btn">Sign in / Up</button>
          </Link>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
