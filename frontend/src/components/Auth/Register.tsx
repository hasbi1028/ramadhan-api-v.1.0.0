/**
 * ═══════════════════════════════════════════════════════
 * Register Component
 * ═══════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { API_URL } from '../../config/env';

interface RegisterProps {
  onBackToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'siswa' as 'siswa' | 'wali_kelas',
    kelas: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('✅ ' + data.message);
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'siswa',
        kelas: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ 
            fontFamily: "'Scheherazade New', serif", 
            fontSize: '28px', 
            color: 'var(--emerald)',
            marginBottom: '4px'
          }}>
            بسم الله الرحمن الرحيم
          </div>
          <h1 style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '20px', 
            color: 'var(--emerald-dark)',
            fontWeight: '700'
          }}>
            📖 Daftar Akun Baru
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>
            Untuk siswa dan wali kelas
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
          <button 
            onClick={onBackToLogin}
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
            Masuk
          </button>
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
            Daftar
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            background: 'var(--red-soft)',
            border: '1px solid rgba(192, 57, 43, 0.3)',
            color: 'var(--red)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '14px',
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(26, 92, 69, 0.08)',
            border: '1px solid rgba(26, 92, 69, 0.3)',
            color: 'var(--emerald-dark)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '14px',
          }}>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--ink-soft)',
              marginBottom: '5px',
              textTransform: 'uppercase',
            }}>
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nama sesuai data sekolah"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid rgba(201, 150, 60, 0.3)',
                borderRadius: '10px',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--ink-soft)',
              marginBottom: '5px',
              textTransform: 'uppercase',
            }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Buat username unik"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid rgba(201, 150, 60, 0.3)',
                borderRadius: '10px',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--ink-soft)',
              marginBottom: '5px',
              textTransform: 'uppercase',
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 karakter"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid rgba(201, 150, 60, 0.3)',
                borderRadius: '10px',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--ink-soft)',
              marginBottom: '5px',
              textTransform: 'uppercase',
            }}>
              Daftar sebagai
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid rgba(201, 150, 60, 0.3)',
                borderRadius: '10px',
                fontSize: '14px',
              }}
            >
              <option value="">-- Pilih role --</option>
              <option value="wali_kelas">Wali Kelas</option>
              <option value="siswa">Siswa</option>
            </select>
          </div>

          {(formData.role === 'wali_kelas' || formData.role === 'siswa') && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--ink-soft)',
                marginBottom: '5px',
                textTransform: 'uppercase',
              }}>
                Kelas
              </label>
              <input
                type="text"
                name="kelas"
                value={formData.kelas}
                onChange={handleChange}
                placeholder="Contoh: 7A, 8B, 9C"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1.5px solid rgba(201, 150, 60, 0.3)',
                  borderRadius: '10px',
                  fontSize: '14px',
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, var(--emerald), var(--emerald-light))',
              color: 'var(--white)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '800',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginTop: '4px',
            }}
          >
            {loading ? '⏳ Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
