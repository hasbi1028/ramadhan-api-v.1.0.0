/**
 * ═══════════════════════════════════════════════════════
 * Register Component
 * ═══════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
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
  const [classes, setClasses] = useState<string[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState('');

  useEffect(() => {
    const loadClasses = async () => {
      setClassesLoading(true);
      setClassesError('');
      try {
        const response = await fetch(`${API_URL}/auth/classes`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Gagal memuat daftar kelas');
        }
        const classNames = (result.classes || []).map((item: { name: string }) => item.name);
        setClasses(classNames);
      } catch (err) {
        setClassesError(err instanceof Error ? err.message : 'Gagal memuat daftar kelas');
      } finally {
        setClassesLoading(false);
      }
    };

    loadClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if ((formData.role === 'siswa' || formData.role === 'wali_kelas') && !formData.kelas) {
      setError('Pilih kelas terlebih dahulu');
      return;
    }

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
              <select
                name="kelas"
                value={formData.kelas}
                onChange={handleChange}
                required
                disabled={classesLoading || classes.length === 0}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1.5px solid rgba(201, 150, 60, 0.3)',
                  borderRadius: '10px',
                  fontSize: '14px',
                }}
              >
                <option value="">-- Pilih kelas --</option>
                {classes.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
              {classesLoading && (
                <p style={{ marginTop: '6px', fontSize: '11px', color: 'var(--ink-soft)' }}>
                  ⏳ Memuat daftar kelas...
                </p>
              )}
              {!classesLoading && classes.length === 0 && (
                <p style={{ marginTop: '6px', fontSize: '11px', color: 'var(--red)' }}>
                  ❌ Belum ada kelas tersedia. Hubungi admin untuk menambahkan kelas.
                </p>
              )}
              {classesError && (
                <p style={{ marginTop: '6px', fontSize: '11px', color: 'var(--red)' }}>
                  ❌ {classesError}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || classesLoading || classes.length === 0}
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
              cursor: loading || classesLoading || classes.length === 0 ? 'not-allowed' : 'pointer',
              opacity: loading || classesLoading || classes.length === 0 ? 0.6 : 1,
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
