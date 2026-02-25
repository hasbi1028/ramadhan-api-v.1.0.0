/**
 * ═══════════════════════════════════════════════════════
 * Siswa Rekap Component - Summary View
 * ═══════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/env';

interface RekapProps {
  user: any;
}

const Rekap: React.FC<RekapProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHari: 0,
    totalPages: 0,
    totalChecks: 0,
    bestDay: null as number | null,
    percentage: 0,
  });

  useEffect(() => {
    loadRekap();
  }, []);

  const loadRekap = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rm_token');
      const response = await fetch(`${API_URL}/amaliah`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      
      // Calculate stats from data
      if (result.data) {
        let totalHari = 0;
        let totalPages = 0;
        let totalChecks = 0;
        let bestDay = null;
        let bestPts = -1;

        Object.entries(result.data).forEach(([day, data]: [string, any]) => {
          totalHari++;
          totalPages += data.pages || 0;
          const checks = Object.values(data.checks || {}).filter(Boolean).length;
          totalChecks += checks;
          
          if (checks > bestPts) {
            bestPts = checks;
            bestDay = parseInt(day);
          }
        });

        const maxPts = totalHari * 22; // Max 22 ibadah per day
        const percentage = maxPts > 0 ? Math.round((totalChecks / maxPts) * 100) : 0;

        setStats({
          totalHari,
          totalPages,
          totalChecks,
          bestDay,
          percentage,
        });
      }
    } catch (error) {
      console.error('Error loading rekap:', error);
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, var(--emerald-dark), var(--emerald))',
        padding: '20px 20px 16px',
        borderRadius: '16px',
        marginBottom: '20px',
        borderBottom: '3px solid var(--gold)',
        color: 'var(--white)',
        textAlign: 'center',
      }}>
        <h2 style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontSize: '20px', 
          marginBottom: '4px' 
        }}>
          📊 Rekap Ramadhanku
        </h2>
        <p style={{ fontSize: '13px', opacity: 0.9 }}>
          {user.name} - Kelas {user.kelas}
        </p>
      </div>

      {/* Progress Ring */}
      <div style={{
        background: 'linear-gradient(135deg, var(--emerald), var(--emerald-dark))',
        borderRadius: '16px',
        padding: '18px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{
          position: 'relative',
          width: '110px',
          height: '110px',
          margin: '14px auto 6px',
        }}>
          <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="55"
              cy="55"
              r="48"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="10"
            />
            <circle
              cx="55"
              cy="55"
              r="48"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="10"
              strokeDasharray="301.6"
              strokeDashoffset={301.6 - (stats.percentage / 100) * 301.6}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '26px',
              fontWeight: '800',
              color: 'var(--gold-light)',
            }}>
              {stats.percentage}%
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
              ibadah
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '20px',
      }}>
        <StatCard
          value={stats.totalHari}
          label="Hari Tercatat"
          icon="📅"
        />
        <StatCard
          value={stats.totalPages}
          label="Hal. Quran"
          icon="📖"
        />
        <StatCard
          value={stats.totalChecks}
          label="Ibadah Selesai"
          icon="✅"
        />
        <StatCard
          value={stats.bestDay ? `Hari ${stats.bestDay}` : '—'}
          label="Hari Terbaik"
          icon="🏆"
        />
      </div>

      {/* Info */}
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
          Semoga amal ibadahmu diterima Allah SWT.
        </p>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  value: number | string;
  label: string;
  icon: string;
}> = ({ value, label, icon }) => {
  return (
    <div style={{
      background: 'var(--cream)',
      borderRadius: '12px',
      padding: '12px',
      border: '1px solid rgba(201, 150, 60, 0.2)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icon}</div>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '26px',
        fontWeight: '700',
        color: 'var(--emerald-dark)',
        lineHeight: '1',
      }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '3px' }}>
        {label}
      </div>
    </div>
  );
};

export default Rekap;
