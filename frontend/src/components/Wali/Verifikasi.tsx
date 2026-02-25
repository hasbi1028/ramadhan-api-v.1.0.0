/**
 * ═══════════════════════════════════════════════════════
 * Wali Verifikasi Component - Student Approval
 * ═══════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/env';

interface Student {
  id: number;
  name: string;
  username: string;
  kelas: string;
  verified: number;
}

interface VerifikasiProps {
  user: any;
}

const Verifikasi: React.FC<VerifikasiProps> = ({ user }) => {
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rm_token');
      
      // Load pending students
      const pendingRes = await fetch(`${API_URL}/wali/siswa/pending`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const pendingData = await pendingRes.json();
      setPendingStudents(pendingData.siswa || []);

      // Load all students
      const allRes = await fetch(`${API_URL}/wali/siswa`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const allData = await allRes.json();
      setAllStudents(allData.siswa || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (studentId: number, action: 'approve' | 'reject') => {
    setActionLoading(studentId);
    try {
      const token = localStorage.getItem('rm_token');
      const reason = action === 'reject' ? prompt('Alasan penolakan (opsional):') : undefined;
      
      const response = await fetch(`${API_URL}/wali/siswa/${studentId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(action === 'approve' ? '✅ Verifikasi sukses' : '❌ Siswa ditolak');
        loadStudents(); // Reload list
      } else {
        alert('❌ ' + (result.error || 'Gagal memproses'));
      }
    } catch (error) {
      alert('❌ Terjadi kesalahan');
    } finally {
      setActionLoading(null);
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
          ✅ Verifikasi Siswa
        </h2>
        <p style={{ fontSize: '13px', opacity: 0.9 }}>
          {user.name} - Kelas {user.kelas}
        </p>
      </div>

      {/* Pending Students */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          background: 'var(--cream)',
          borderRadius: '16px',
          padding: '18px',
          border: '1px solid rgba(201, 150, 60, 0.2)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '15px',
              color: 'var(--emerald-dark)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              ⏳ Siswa Pending Verifikasi
              <span style={{
                padding: '2px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                background: 'rgba(201, 150, 60, 0.15)',
                color: 'var(--gold)',
                border: '1px solid rgba(201, 150, 60, 0.4)',
              }}>
                {pendingStudents.length}
              </span>
            </h3>
          </div>

          {pendingStudents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '30px 16px',
              color: 'var(--ink-soft)',
            }}>
              <div style={{ fontSize: '38px', marginBottom: '8px' }}>🎉</div>
              <p>Tidak ada siswa pending.</p>
            </div>
          ) : (
            <div>
              {pendingStudents.map(student => (
                <div
                  key={student.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 0',
                    borderBottom: '1px dashed rgba(201, 150, 60, 0.18)',
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'var(--emerald)',
                    color: 'var(--gold-light)',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: '0',
                    fontWeight: '700',
                  }}>
                    {student.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: 'var(--ink)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {student.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--ink-soft)',
                    }}>
                      @{student.username} {student.kelas ? `· Kelas ${student.kelas}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: '0' }}>
                    <button
                      onClick={() => handleVerify(student.id, 'approve')}
                      disabled={actionLoading === student.id}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(26, 92, 69, 0.3)',
                        background: 'rgba(26, 92, 69, 0.12)',
                        color: 'var(--emerald)',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: actionLoading === student.id ? 'not-allowed' : 'pointer',
                        opacity: actionLoading === student.id ? 0.6 : 1,
                        transition: 'all 0.18s',
                      }}
                    >
                      {actionLoading === student.id ? '⏳' : '✓'} Setujui
                    </button>
                    <button
                      onClick={() => handleVerify(student.id, 'reject')}
                      disabled={actionLoading === student.id}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(192, 57, 43, 0.3)',
                        background: 'var(--red-soft)',
                        color: 'var(--red)',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: actionLoading === student.id ? 'not-allowed' : 'pointer',
                        opacity: actionLoading === student.id ? 0.6 : 1,
                        transition: 'all 0.18s',
                      }}
                    >
                      {actionLoading === student.id ? '⏳' : '✗'} Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Students */}
      <div>
        <div style={{
          background: 'var(--cream)',
          borderRadius: '16px',
          padding: '18px',
          border: '1px solid rgba(201, 150, 60, 0.2)',
        }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '15px',
            color: 'var(--emerald-dark)',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            ✅ Semua Siswa Kelas {user.kelas}
          </h3>

          {allStudents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '30px 16px',
              color: 'var(--ink-soft)',
            }}>
              <div style={{ fontSize: '38px', marginBottom: '8px' }}>👥</div>
              <p>Belum ada siswa terdaftar di kelas ini.</p>
            </div>
          ) : (
            <div>
              {allStudents.map(student => {
                const status = student.verified === 1 ? 'approved' : student.verified === 2 ? 'rejected' : 'pending';
                const statusLabel = { approved: '✅ Terverifikasi', rejected: '❌ Ditolak', pending: '⏳ Pending' }[status];
                
                return (
                  <div
                    key={student.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 0',
                      borderBottom: '1px dashed rgba(201, 150, 60, 0.18)',
                    }}
                  >
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      background: status === 'approved' ? 'rgba(26, 92, 69, 0.12)' : 
                                 status === 'rejected' ? 'var(--red-soft)' : 'rgba(201, 150, 60, 0.15)',
                      color: status === 'approved' ? 'var(--emerald)' : 
                             status === 'rejected' ? 'var(--red)' : 'var(--gold)',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: '0',
                      fontWeight: '700',
                    }}>
                      {student.name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: 'var(--ink)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {student.name}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--ink-soft)',
                      }}>
                        @{student.username} {student.kelas ? `· Kelas ${student.kelas}` : ''}
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '10px',
                      fontWeight: '700',
                      background: status === 'approved' ? 'rgba(26, 92, 69, 0.1)' : 
                                 status === 'rejected' ? 'var(--red-soft)' : 'rgba(201, 150, 60, 0.15)',
                      color: status === 'approved' ? 'var(--emerald)' : 
                             status === 'rejected' ? 'var(--red)' : 'var(--gold)',
                      border: '1px solid ' + (status === 'approved' ? 'rgba(26, 92, 69, 0.3)' : 
                                            status === 'rejected' ? 'rgba(192, 57, 43, 0.3)' : 'rgba(201, 150, 60, 0.4)'),
                    }}>
                        {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verifikasi;
