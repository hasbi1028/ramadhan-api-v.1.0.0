/**
 * ═══════════════════════════════════════════════════════
 * Main App Component
 * ═══════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { API_URL } from './config/env';
import { useToast } from './hooks/useToast';
import { registerServiceWorker } from './hooks/useServiceWorker';
import { useErrorTracking } from './hooks/useErrorTracking';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Catat from './components/Siswa/Catat';
import Rekap from './components/Siswa/Rekap';
import Verifikasi from './components/Wali/Verifikasi';
import CekParaf from './components/Wali/CekParaf';
import Dashboard from './components/Admin/Dashboard';
import UserManagement from './components/Admin/UserManagement';
import ClassManagement from './components/Admin/ClassManagement';
import ProfilePage from './components/Profile/ProfilePage';
import ToastContainer from './components/ToastContainer';

interface User {
  id: number;
  name: string;
  username: string;
  role: 'admin' | 'wali_kelas' | 'siswa';
  kelas?: string;
  verified: number;
}

type Page = 'catat' | 'rekap' | 'verifikasi' | 'cek-paraf' | 'profil';
type AdminTab = 'dashboard' | 'wali' | 'siswa' | 'kelas' | 'profil';

const App: React.FC = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  const devLog = (...args: unknown[]) => {
    if (isDev) console.log(...args);
  };

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('catat');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  
  // Toast notifications
  const { toasts, success, error, info, warning, removeToast } = useToast();
  
  // Error tracking (production only)
  const { trackError } = useErrorTracking();

  useEffect(() => {
    devLog('[UI] App init start');

    // Check if already logged in
    const token = localStorage.getItem('rm_token');
    const userData = localStorage.getItem('rm_user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData) as User;
        setUser(parsedUser);
        devLog('[UI] Session restored', { username: parsedUser.username, role: parsedUser.role });
      } catch (err) {
        console.error('[UI] Invalid rm_user in localStorage, clearing session', { userData, err });
        localStorage.removeItem('rm_token');
        localStorage.removeItem('rm_user');
      }
    } else {
      devLog('[UI] No saved session found');
    }

    setLoading(false);
    
    // Register Service Worker for PWA
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();
    }
  }, []);

  const handleLogin = (userData: User, token: string) => {
    devLog('[UI] Login success', { username: userData.username, role: userData.role });
    localStorage.setItem('rm_token', token);
    localStorage.setItem('rm_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    devLog('[UI] Logout');
    localStorage.removeItem('rm_token');
    localStorage.removeItem('rm_user');
    setUser(null);
  };

  const handleUserUpdated = (nextUser: User) => {
    setUser(nextUser);
    localStorage.setItem('rm_user', JSON.stringify(nextUser));
    success('Profil berhasil diperbarui');
  };

  const renderPage = () => {
    if (!user) return null;

    // Role-based rendering
    if (user.role === 'siswa') {
      switch (currentPage) {
        case 'catat':
          return <Catat user={user} />;
        case 'rekap':
          return <Rekap user={user} />;
        case 'profil':
          return <ProfilePage user={user} onUserUpdated={handleUserUpdated} />;
        default:
          return <Catat user={user} />;
      }
    }

    // Wali Kelas pages
    if (user.role === 'wali_kelas') {
      switch (currentPage) {
        case 'verifikasi':
          return <Verifikasi user={user} />;
        case 'cek-paraf':
          return <CekParaf user={user} />;
        case 'profil':
          return <ProfilePage user={user} onUserUpdated={handleUserUpdated} />;
        default:
          return <Verifikasi user={user} />;
      }
    }

    // Admin pages
    if (user.role === 'admin') {
      switch (adminTab) {
        case 'dashboard':
          return <Dashboard user={user} />;
        case 'wali':
          return <UserManagement user={user} role="wali_kelas" />;
        case 'siswa':
          return <UserManagement user={user} role="siswa" />;
        case 'kelas':
          return <ClassManagement user={user} />;
        case 'profil':
          return <ProfilePage user={user} onUserUpdated={handleUserUpdated} />;
        default:
          return <Dashboard user={user} />;
      }
    }

    return null;
  };

  const renderNav = () => {
    if (!user) return null;

    // Siswa navigation
    if (user.role === 'siswa') {
      return (
        <nav style={{
          display: 'flex',
          background: 'var(--emerald-dark)',
          borderBottom: '2px solid var(--gold)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <button
            onClick={() => setCurrentPage('catat')}
            style={{
              flex: 1,
              padding: '11px 6px',
              background: 'none',
              border: 'none',
              color: currentPage === 'catat' ? 'var(--gold-light)' : 'rgba(255,255,255,0.45)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            ✏️ Catat
          </button>
          <button
            onClick={() => setCurrentPage('rekap')}
            style={{
              flex: 1,
              padding: '11px 6px',
              background: 'none',
              border: 'none',
              color: currentPage === 'rekap' ? 'var(--gold-light)' : 'rgba(255,255,255,0.45)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            📊 Rekap
          </button>
          <button
            onClick={() => setCurrentPage('profil')}
            style={{
              flex: 1,
              padding: '11px 6px',
              background: 'none',
              border: 'none',
              color: currentPage === 'profil' ? 'var(--gold-light)' : 'rgba(255,255,255,0.45)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            👤 Profil
          </button>
        </nav>
      );
    }

    // Wali Kelas navigation
    if (user.role === 'wali_kelas') {
      return (
        <nav style={{
          display: 'flex',
          background: 'var(--emerald-dark)',
          borderBottom: '2px solid var(--gold)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <button
            onClick={() => setCurrentPage('verifikasi')}
            style={{
              flex: 1,
              padding: '11px 6px',
              background: 'none',
              border: 'none',
              color: currentPage === 'verifikasi' ? 'var(--gold-light)' : 'rgba(255,255,255,0.45)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            ✅ Verifikasi
          </button>
          <button
            onClick={() => setCurrentPage('cek-paraf')}
            style={{
              flex: 1,
              padding: '11px 6px',
              background: 'none',
              border: 'none',
              color: currentPage === 'cek-paraf' ? 'var(--gold-light)' : 'rgba(255,255,255,0.45)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            📝 Cek Paraf
          </button>
          <button
            onClick={() => setCurrentPage('profil')}
            style={{
              flex: 1,
              padding: '11px 6px',
              background: 'none',
              border: 'none',
              color: currentPage === 'profil' ? 'var(--gold-light)' : 'rgba(255,255,255,0.45)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            👤 Profil
          </button>
        </nav>
      );
    }

    // Admin navigation
    if (user.role === 'admin') {
      return (
        <nav style={{
          display: 'flex',
          background: 'var(--emerald-dark)',
          borderBottom: '2px solid var(--gold)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <button
            onClick={() => setAdminTab('dashboard')}
            style={{
              flex: 1,
              padding: '11px 6px',
              background: 'none',
              border: 'none',
              color: adminTab === 'dashboard' ? 'var(--gold-light)' : 'rgba(255,255,255,0.45)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            🏠 Dashboard
          </button>
          <button
            onClick={() => setAdminTab('wali')}
            style={{
              flex: 1,
              padding: '11px 6px',
              background: 'none',
              border: 'none',
              color: adminTab === 'wali' ? 'var(--gold-light)' : 'rgba(255,255,255,0.45)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            👩‍🏫 Wali Kelas
          </button>
          <button
            onClick={() => setAdminTab('siswa')}
            style={{
              flex: 1,
              padding: '11px 6px',
              background: 'none',
              border: 'none',
              color: adminTab === 'siswa' ? 'var(--gold-light)' : 'rgba(255,255,255,0.45)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            🎓 Siswa
          </button>
          <button
            onClick={() => setAdminTab('kelas')}
            style={{
              flex: 1,
              padding: '11px 6px',
              background: 'none',
              border: 'none',
              color: adminTab === 'kelas' ? 'var(--gold-light)' : 'rgba(255,255,255,0.45)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            🏫 Kelas
          </button>
          <button
            onClick={() => setAdminTab('profil')}
            style={{
              flex: 1,
              padding: '11px 6px',
              background: 'none',
              border: 'none',
              color: adminTab === 'profil' ? 'var(--gold-light)' : 'rgba(255,255,255,0.45)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            👤 Profil
          </button>
        </nav>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{ color: 'var(--gold)', fontSize: '24px' }}>
          ⏳ Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <Register onBackToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={handleLogin} onRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'var(--emerald-dark)',
    }}>
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <header style={{
        background: 'linear-gradient(160deg, var(--emerald-dark), var(--emerald))',
        padding: '20px 20px 16px',
        borderBottom: '3px solid var(--gold)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ 
              fontFamily: "'Scheherazade New', serif", 
              fontSize: '20px', 
              color: 'var(--gold-light)',
              lineHeight: '1' 
            }}>
              📖 Amaliah Ramadhan
            </div>
            <h1 style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: '16px', 
              color: 'var(--white)',
              fontWeight: '700' 
            }}>
              Buku Amaliah
            </h1>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.72)',
              marginTop: '2px',
              letterSpacing: '0.3px',
            }}>
              MTs Negeri 2 Kolaka Utara
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '700', 
              color: 'var(--gold-light)' 
            }}>
              {user.name}
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: 'rgba(255,255,255,0.55)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {user.role === 'siswa' ? 'Siswa' : user.role === 'wali_kelas' ? 'Wali Kelas' : 'Administrator'}
              {user.kelas ? ` — ${user.kelas}` : ''}
            </div>
            <button
              onClick={handleLogout}
              style={{
                marginTop: '4px',
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.8)',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {renderNav()}

      {/* Page Content */}
      <main>
        {renderPage()}
      </main>

      <footer
        style={{
          textAlign: 'center',
          padding: '12px 16px 16px',
          color: 'rgba(255,255,255,0.72)',
          borderTop: '1px solid rgba(201, 150, 60, 0.2)',
          marginTop: '8px',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: '700' }}>MTs Negeri 2 Kolaka Utara</div>
        <div style={{ fontSize: '11px', opacity: 0.9 }}>Dibuat oleh hasbi1028</div>
      </footer>
    </div>
  );
};

export default App;
