/**
 * ═══════════════════════════════════════════════════════
 * Login Component
 * ═══════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { API_URL } from '../../config/env';

interface User {
  id: number;
  name: string;
  username: string;
  role: 'admin' | 'wali_kelas' | 'siswa';
  kelas?: string;
  verified: number;
}

interface LoginProps {
  onLogin: (user: User, token: string) => void;
  onRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLogin(data.user, data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--cream)',
        borderRadius: '24px',
        padding: '32px 28px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        border: '1px solid rgba(201, 150, 60, 0.25)',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }} role="banner">
          <div style={{ 
            fontFamily: "'Scheherazade New', serif", 
            fontSize: '28px', 
            color: 'var(--emerald)',
            marginBottom: '4px'
          }} aria-label="Bismillah">
            بسم الله الرحمن الرحيم
          </div>
          <h1 style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '20px', 
            color: 'var(--emerald-dark)',
            fontWeight: '700'
          }}>
            📖 Buku Amaliah Ramadhan
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>
            Catatan ibadah harian selama Ramadhan
          </p>
          <p style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '6px', fontWeight: '700' }}>
            MTs Negeri 2 Kolaka Utara
          </p>
          <p style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>
            Dibuat oleh hasbi1028
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--parchment)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '24px',
          gap: '4px',
        }}>
          <button style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            background: 'var(--emerald)',
            color: 'var(--white)',
            borderRadius: '9px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
          }}>
            Masuk
          </button>
          <button 
            onClick={onRegister}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--ink-soft)',
              borderRadius: '9px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Daftar
          </button>
        </div>

        {/* Error */}
        {error && (
          <div 
            role="alert" 
            aria-live="assertive"
            style={{
              background: 'var(--red-soft)',
              border: '1px solid rgba(192, 57, 43, 0.3)',
              color: 'var(--red)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '14px',
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} aria-label="Login form">
          <div style={{ marginBottom: '14px' }}>
            <label 
              htmlFor="username"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--ink-soft)',
                marginBottom: '5px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              autoComplete="username"
              aria-required="true"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid rgba(201, 150, 60, 0.3)',
                borderRadius: '10px',
                background: 'var(--white)',
                fontSize: '14px',
                color: 'var(--ink)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label 
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--ink-soft)',
                marginBottom: '5px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              autoComplete="current-password"
              aria-required="true"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid rgba(201, 150, 60, 0.3)',
                borderRadius: '10px',
                background: 'var(--white)',
                fontSize: '14px',
                color: 'var(--ink)',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              color: 'var(--emerald-dark)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '800',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginTop: '4px',
            }}
          >
            {loading ? '⏳ Masuk...' : 'Masuk'}
          </button>
        </form>

        {/* Default credentials hint */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(26, 92, 69, 0.08)',
          border: '1px solid rgba(26, 92, 69, 0.2)',
          borderRadius: '10px',
          fontSize: '11px',
          color: 'var(--emerald-dark)',
        }}>
          <strong>Default Login:</strong><br/>
          Admin: admin / admin123<br/>
          Siswa: siswa7A / password123<br/>
          Wali: wali7A / password123
        </div>
      </div>
    </div>
  );
};

export default Login;
