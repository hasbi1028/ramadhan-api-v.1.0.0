/**
 * ═══════════════════════════════════════════════════════
 * Wali Cek Paraf Component - Parent Verification Check
 * ═══════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/env';

interface StudentVerification {
  id: number;
  name: string;
  username: string;
  kelas: string;
  day: number | null;
  has_data: boolean;
  parent_verified: number;
  parent_name?: string;
  parent_signature?: string;
  parent_verified_at?: string;
  pages: number;
  checks?: Record<string, boolean>;
  catatan?: string;
  tema_tarawih?: string;
  tema_kultum_subuh?: string;
  verification_status: 'verified' | 'pending' | 'no_data';
}

interface CekParafProps {
  user: any;
}

const IBADAH_SECTIONS = [
  {
    title: 'Sholat Fardhu',
    items: [
      { id: 'subuh', label: 'Sholat Subuh (Berjamaah)' },
      { id: 'dzuhur', label: 'Sholat Dzuhur' },
      { id: 'ashar', label: 'Sholat Ashar' },
      { id: 'maghrib', label: 'Sholat Maghrib (Berjamaah)' },
      { id: 'isya', label: 'Sholat Isya (Berjamaah)' },
    ],
  },
  {
    title: 'Ibadah Sunnah',
    items: [
      { id: 'sahur', label: 'Makan Sahur' },
      { id: 'buka', label: 'Berbuka tepat waktu' },
      { id: 'tarawih', label: 'Sholat Tarawih' },
      { id: 'witir', label: 'Sholat Witir' },
      { id: 'duha', label: 'Sholat Dhuha' },
      { id: 'tahajud', label: 'Sholat Tahajud' },
      { id: 'rawatib', label: 'Sholat Sunnah Rawatib' },
    ],
  },
  {
    title: "Al-Qur'an & Dzikir",
    items: [
      { id: 'tadarus', label: "Membaca Al-Qur'an" },
      { id: 'hafalan', label: "Menghafal/Muraja'ah" },
      { id: 'dzikir', label: 'Dzikir Pagi & Petang' },
    ],
  },
  {
    title: 'Akhlak & Sosial',
    items: [
      { id: 'infaq', label: 'Infaq / Sedekah' },
      { id: 'puasa', label: 'Puasa Penuh (tdk batal)' },
      { id: 'menahan', label: 'Menjaga Lisan & Perilaku' },
      { id: 'tilawatquran', label: 'Menyimak kajian/ceramah' },
      { id: 'berbakti', label: 'Berbakti kepada Orang Tua' },
    ],
  },
];

const TOTAL_IBADAH_ITEMS = IBADAH_SECTIONS.reduce((sum, section) => sum + section.items.length, 0);

const CekParaf: React.FC<CekParafProps> = ({ user }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [verifications, setVerifications] = useState<StudentVerification[]>([]);
  const [expandedStudents, setExpandedStudents] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    verified: 0,
    pending: 0,
    noData: 0,
  });

  useEffect(() => {
    loadVerifications(selectedDay);
  }, [selectedDay]);

  const loadVerifications = async (day: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rm_token');
      const response = await fetch(`${API_URL}/wali/verification-summary?day=${day}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      setVerifications(result.summary || []);
      setExpandedStudents({});
      
      // Calculate stats
      const verified = result.summary?.filter((s: any) => s.verification_status === 'verified').length || 0;
      const pending = result.summary?.filter((s: any) => s.verification_status === 'pending').length || 0;
      const noData = result.summary?.filter((s: any) => s.verification_status === 'no_data').length || 0;
      
      setStats({ verified, pending, noData });
    } catch (error) {
      console.error('Error loading verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentDetail = (studentId: number) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleReset = async (studentId: number, day: number, studentName: string) => {
    if (!confirm(`⚠️ Yakin ingin membatalkan verifikasi untuk:\n\n👤 Siswa: ${studentName}\n📅 Hari: ${day}\n\nSiswa akan dapat mengisi ulang kegiatan hari ini.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('rm_token');
      const response = await fetch(`${API_URL}/wali/siswa/${studentId}/reset-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ day }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ ' + result.message);
        loadVerifications(selectedDay); // Reload list
      } else {
        alert('❌ ' + (result.error || 'Gagal mereset verifikasi'));
      }
    } catch (error) {
      alert('❌ Terjadi kesalahan');
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
          📝 Cek Paraf Orang Tua Per Hari
        </h2>
        <p style={{ fontSize: '13px', opacity: 0.9 }}>
          {user.name} - Kelas {user.kelas}
        </p>
      </div>

      {/* Day Selector */}
      <div style={{
        background: 'var(--cream)',
        borderRadius: '16px',
        padding: '18px',
        border: '1px solid rgba(201, 150, 60, 0.2)',
        marginBottom: '20px',
      }}>
        <label style={{
          fontSize: '12px',
          fontWeight: '700',
          color: 'var(--ink-soft)',
          marginBottom: '10px',
          display: 'block',
          textTransform: 'uppercase',
        }}>
          Pilih Hari:
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gap: '6px',
        }}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                aspectRatio: '1',
                border: '2px solid rgba(26, 92, 69, 0.2)',
                borderRadius: '10px',
                background: selectedDay === day ? 'var(--emerald)' : 'var(--cream)',
                color: selectedDay === day ? 'var(--white)' : 'var(--emerald-dark)',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.18s',
                boxShadow: selectedDay === day ? '0 3px 10px rgba(26, 92, 69, 0.3)' : 'none',
              }}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '700',
          background: 'rgba(26, 92, 69, 0.12)',
          color: 'var(--emerald)',
          border: '1px solid rgba(26, 92, 69, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          ✅ {stats.verified} Terverifikasi
        </div>
        <div style={{
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '700',
          background: 'rgba(201, 150, 60, 0.12)',
          color: 'var(--gold)',
          border: '1px solid rgba(201, 150, 60, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          ⏳ {stats.pending} Pending
        </div>
        <div style={{
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '700',
          background: '#f0f0f0',
          color: '#888',
          border: '1px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          📝 {stats.noData} Belum Isi
        </div>
      </div>

      {/* Verification List */}
      <div style={{
        background: 'var(--cream)',
        borderRadius: '16px',
        padding: '18px',
        border: '1px solid rgba(201, 150, 60, 0.2)',
      }}>
        {verifications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '30px 16px',
            color: 'var(--ink-soft)',
          }}>
            <div style={{ fontSize: '38px', marginBottom: '8px' }}>👆</div>
            <p>Pilih hari untuk melihat status paraf orang tua.</p>
          </div>
        ) : (
          <div>
            {verifications.map(student => {
              const statusConfig = {
                verified: { icon: '✅', color: 'var(--emerald)', bg: 'rgba(26, 92, 69, 0.15)', label: 'Terverifikasi' },
                pending: { icon: '⏳', color: 'var(--gold)', bg: 'rgba(201, 150, 60, 0.15)', label: 'Belum Paraf' },
                no_data: { icon: '📝', color: '#999', bg: '#f5f5f5', label: 'Belum Isi' },
              };
              const cfg = statusConfig[student.verification_status];
              const isExpanded = !!expandedStudents[student.id];

              return (
                <div
                  key={student.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '14px 0',
                    borderBottom: '1px dashed rgba(201, 150, 60, 0.15)',
                  }}
                >
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: cfg.bg,
                    color: cfg.color,
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: '0',
                    fontWeight: '700',
                  }}>
                    {student.name[0]}
                  </div>
                  <div style={{ flex: '1', minWidth: '0' }}>
                    <div style={{
                      fontWeight: '700',
                      color: cfg.color,
                      marginBottom: '6px',
                      fontSize: '14px',
                    }}>
                      {cfg.icon} {student.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                      {student.has_data ? 'Detail ibadah tersedia' : 'Belum mengisi kegiatan'}
                    </div>

                    {student.has_data && (
                      <button
                        type="button"
                        onClick={() => toggleStudentDetail(student.id)}
                        style={{
                          marginTop: '8px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(201, 150, 60, 0.35)',
                          background: 'var(--cream)',
                          color: 'var(--ink-soft)',
                          fontSize: '10px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        {isExpanded ? '🔽 Sembunyikan Detail Ibadah' : '▶️ Lihat Detail Ibadah'}
                      </button>
                    )}

                    {student.has_data && isExpanded && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '10px',
                          borderRadius: '10px',
                          border: '1px solid rgba(201, 150, 60, 0.2)',
                          background: '#fff',
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-soft)', marginBottom: '8px' }}>
                          📊 Ringkasan Ibadah
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: 'rgba(26, 92, 69, 0.12)',
                            color: 'var(--emerald-dark)',
                          }}>
                            ✅ {Object.values(student.checks || {}).filter(Boolean).length}/{TOTAL_IBADAH_ITEMS} ibadah
                          </span>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: 'rgba(201, 150, 60, 0.12)',
                            color: 'var(--gold)',
                          }}>
                            📖 {student.pages || 0} halaman Qur'an
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                          {IBADAH_SECTIONS.map((section) => (
                            <div key={section.title} style={{ background: 'var(--cream)', borderRadius: '8px', padding: '8px' }}>
                              <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--ink-soft)', marginBottom: '6px' }}>
                                {section.title}
                              </div>
                              {section.items.map((item) => {
                                const checked = !!student.checks?.[item.id];
                                return (
                                  <div key={item.id} style={{ fontSize: '10px', color: checked ? 'var(--emerald-dark)' : '#999', marginBottom: '3px' }}>
                                    {checked ? '✅' : '⬜'} {item.label}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>

                        {(student.tema_tarawih || student.tema_kultum_subuh || student.catatan) && (
                          <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--ink-soft)' }}>
                            {student.tema_tarawih && <div>🕌 Tema Tarawih: {student.tema_tarawih}</div>}
                            {student.tema_kultum_subuh && <div>🌅 Tema Kultum Subuh: {student.tema_kultum_subuh}</div>}
                            {student.catatan && <div>📝 Catatan: {student.catatan}</div>}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Signature Thumbnail (if verified) */}
                    {student.parent_signature && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '9px', color: 'var(--ink-soft)', marginBottom: '4px', fontWeight: '700' }}>
                          ✍️ Tanda Tangan
                        </div>
                        <img
                          src={student.parent_signature}
                          alt="TTD"
                          style={{
                            width: '80px',
                            height: '60px',
                            objectFit: 'contain',
                            background: '#fff',
                            borderRadius: '6px',
                            border: '2px solid var(--gold)',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
                          onClick={() => {
                            // Open in modal (TODO: Implement modal)
                            const w = window.open('', '_blank');
                            w?.document.write(`<img src="${student.parent_signature}" style="max-width:100%" />`);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div style={{
                    textAlign: 'right',
                    flexShrink: '0',
                    minWidth: '140px',
                    marginLeft: '12px',
                  }}>
                    <span style={{
                      padding: '6px 10px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '700',
                      background: cfg.bg,
                      color: cfg.color,
                      border: '1px solid ' + cfg.color,
                      display: 'block',
                      marginBottom: '6px',
                    }}>
                      {cfg.label}
                    </span>
                    {student.parent_name && (
                      <div style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: '600' }}>
                        👤 {student.parent_name}
                      </div>
                    )}
                    {student.parent_verified_at && (
                      <div style={{ fontSize: '10px', color: '#999', marginTop: '3px' }}>
                        📅 {new Date(student.parent_verified_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    )}
                    
                    {/* Reset Button (only for verified) */}
                    {student.verification_status === 'verified' && student.day && (
                      <button
                        onClick={() => handleReset(student.id, student.day, student.name)}
                        style={{
                          marginTop: '8px',
                          padding: '4px 10px',
                          fontSize: '10px',
                          background: 'var(--red)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        🔄 Batalkan Verifikasi
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CekParaf;
