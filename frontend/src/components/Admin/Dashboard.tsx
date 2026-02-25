/**
 * ═══════════════════════════════════════════════════════
 * Admin Dashboard Component
 * ═══════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/env';

interface AdminProps {
  user: any;
}

interface Stats {
  total_wali_kelas: number;
  total_siswa: number;
  pending_wali_kelas: number;
  total_quran_pages: number;
}

const Dashboard: React.FC<AdminProps> = ({ user }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rm_token');
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      setStats(result.stats || null);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '200px' 
      }}>
        <div style={{ color: 'var(--gold)', fontSize: '24px' }}>
          ⏳ Memuat...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--emerald-dark), var(--emerald))',
        padding: '20px',
        borderRadius: '16px',
        marginBottom: '20px',
        color: 'var(--white)',
      }}>
        <h2 style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontSize: '20px', 
          marginBottom: '4px' 
        }}>
          🏠 Dashboard Admin
        </h2>
        <p style={{ fontSize: '13px', opacity: 0.9 }}>
          {user.name} - Administrator
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          marginBottom: '20px',
        }}>
          <StatCard
            icon="👩‍🏫"
            value={stats.total_wali_kelas}
            label="Total Wali Kelas"
            color="var(--emerald)"
          />
          <StatCard
            icon="🎓"
            value={stats.total_siswa}
            label="Total Siswa"
            color="var(--gold)"
          />
          <StatCard
            icon="⏳"
            value={stats.pending_wali_kelas}
            label="Pending Wali Kelas"
            color="var(--red)"
          />
          <StatCard
            icon="📖"
            value={stats.total_quran_pages}
            label="Halaman Al-Qur'an"
            color="var(--emerald)"
          />
        </div>
      )}

      {/* Info Card */}
      <div style={{
        background: 'var(--cream)',
        borderRadius: '16px',
        padding: '18px',
        border: '1px solid rgba(201, 150, 60, 0.2)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🌙</div>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '16px',
          color: 'var(--emerald-dark)',
          marginBottom: '8px',
        }}>
          مَرْحَبًا يَا رَمَضَان
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
          Panel administrasi untuk mengelola pengguna dan monitoring kegiatan.
        </p>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: string;
  value: number;
  label: string;
  color: string;
}> = ({ icon, value, label, color }) => {
  return (
    <div style={{
      background: 'var(--cream)',
      borderRadius: '12px',
      padding: '14px',
      border: '1px solid rgba(201, 150, 60, 0.2)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '28px', marginBottom: '6px' }}>{icon}</div>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '30px',
        fontWeight: '700',
        color: color,
        lineHeight: '1',
      }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '4px' }}>
        {label}
      </div>
    </div>
  );
};

export default Dashboard;
