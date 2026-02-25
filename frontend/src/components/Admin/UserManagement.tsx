/**
 * ═══════════════════════════════════════════════════════
 * Admin User Management Component
 * ═══════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/env';

interface User {
  id: number;
  name: string;
  username: string;
  kelas: string;
  verified: number;
}

interface UserManagementProps {
  user: any;
  role: 'wali_kelas' | 'siswa';
}

const UserManagement: React.FC<UserManagementProps> = ({ user, role }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, [role]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rm_token');
      const response = await fetch(`${API_URL}/admin/users?role=${role}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      setUsers(result.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId: number, action: 'approve' | 'reject') => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('rm_token');
      const reason = action === 'reject' ? prompt('Alasan penolakan (opsional):') : undefined;
      
      const response = await fetch(`${API_URL}/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(action === 'approve' ? '✅ Verifikasi sukses' : '❌ User ditolak');
        loadUsers();
      } else {
        alert('❌ ' + (result.error || 'Gagal memproses'));
      }
    } catch (error) {
      alert('❌ Terjadi kesalahan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: number, userName: string) => {
    if (!confirm(`⚠️ Yakin ingin menghapus user:\n\n👤 ${userName}\n\nData amaliah user ini juga akan terhapus!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('rm_token');
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ ' + (result.message || 'User berhasil dihapus'));
        loadUsers();
      } else {
        alert('❌ ' + (result.error || 'Gagal menghapus'));
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
          {role === 'wali_kelas' ? '👩‍🏫 Manajemen Wali Kelas' : '🎓 Manajemen Siswa'}
        </h2>
        <p style={{ fontSize: '13px', opacity: 0.9 }}>
          {user.name} - Administrator
        </p>
      </div>

      {/* Users List */}
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
        }}>
          Daftar {role === 'wali_kelas' ? 'Wali Kelas' : 'Siswa'}
        </h3>

        {users.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '30px 16px',
            color: 'var(--ink-soft)',
          }}>
            <div style={{ fontSize: '38px', marginBottom: '8px' }}>👥</div>
            <p>Belum ada {role === 'wali_kelas' ? 'wali kelas' : 'siswa'} terdaftar.</p>
          </div>
        ) : (
          <div>
            {users.map(u => {
              const status = u.verified === 1 ? 'approved' : u.verified === 2 ? 'rejected' : 'pending';
              const statusLabel = { approved: '✅ Terverifikasi', rejected: '❌ Ditolak', pending: '⏳ Pending' }[status];
              
              return (
                <div
                  key={u.id}
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
                    {u.name[0]}
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
                      {u.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--ink-soft)',
                    }}>
                      @{u.username} {u.kelas ? `· Kelas ${u.kelas}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: '0' }}>
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
                    
                    {status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleVerify(u.id, 'approve')}
                          disabled={actionLoading === u.id}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(26, 92, 69, 0.3)',
                            background: 'rgba(26, 92, 69, 0.12)',
                            color: 'var(--emerald)',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                            opacity: actionLoading === u.id ? 0.6 : 1,
                          }}
                        >
                          {actionLoading === u.id ? '⏳' : '✓'}
                        </button>
                        <button
                          onClick={() => handleVerify(u.id, 'reject')}
                          disabled={actionLoading === u.id}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(192, 57, 43, 0.3)',
                            background: 'var(--red-soft)',
                            color: 'var(--red)',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                            opacity: actionLoading === u.id ? 0.6 : 1,
                          }}
                        >
                          {actionLoading === u.id ? '⏳' : '✗'}
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      disabled={actionLoading === u.id}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--red-soft)',
                        color: 'var(--red)',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                        opacity: actionLoading === u.id ? 0.6 : 1,
                      }}
                    >
                      🗑
                    </button>
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

export default UserManagement;
