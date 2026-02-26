import React, { useEffect, useState } from 'react';
import { API_URL } from '../../config/env';

interface ClassItem {
  id: number;
  name: string;
  is_active: number;
}

interface ClassManagementProps {
  user: any;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ user }) => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClassName, setNewClassName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [actionLoading, setActionLoading] = useState<number | 'create' | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rm_token');
      const response = await fetch(`${API_URL}/admin/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      setClasses(result.classes || []);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const name = newClassName.trim();
    if (!name) return;

    setActionLoading('create');
    try {
      const token = localStorage.getItem('rm_token');
      const response = await fetch(`${API_URL}/admin/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (!response.ok) {
        alert(`❌ ${result.error || 'Gagal menambah kelas'}`);
        return;
      }
      setNewClassName('');
      await loadClasses();
    } catch {
      alert('❌ Terjadi kesalahan');
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (item: ClassItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveEdit = async (id: number) => {
    const name = editingName.trim();
    if (!name) return;

    setActionLoading(id);
    try {
      const token = localStorage.getItem('rm_token');
      const response = await fetch(`${API_URL}/admin/classes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (!response.ok) {
        alert(`❌ ${result.error || 'Gagal mengubah kelas'}`);
        return;
      }
      cancelEdit();
      await loadClasses();
    } catch {
      alert('❌ Terjadi kesalahan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (item: ClassItem) => {
    const ok = confirm(`⚠️ Hapus kelas "${item.name}"?\n\nKelas yang masih dipakai user tidak bisa dihapus.`);
    if (!ok) return;

    setActionLoading(item.id);
    try {
      const token = localStorage.getItem('rm_token');
      const response = await fetch(`${API_URL}/admin/classes/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) {
        alert(`❌ ${result.error || 'Gagal menghapus kelas'}`);
        return;
      }
      await loadClasses();
    } catch {
      alert('❌ Terjadi kesalahan');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <div style={{ color: 'var(--gold)', fontSize: '24px' }}>⏳ Memuat...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, var(--emerald-dark), var(--emerald))',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '20px',
          color: 'var(--white)',
        }}
      >
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', marginBottom: '4px' }}>🏫 Manajemen Kelas</h2>
        <p style={{ fontSize: '13px', opacity: 0.9 }}>{user.name} - Administrator</p>
      </div>

      <div
        style={{
          background: 'var(--cream)',
          borderRadius: '16px',
          padding: '18px',
          border: '1px solid rgba(201, 150, 60, 0.2)',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ fontSize: '15px', color: 'var(--emerald-dark)', marginBottom: '10px' }}>Tambah Kelas</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Contoh: 7A"
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1.5px solid rgba(201, 150, 60, 0.3)',
              fontSize: '14px',
            }}
          />
          <button
            onClick={handleCreate}
            disabled={actionLoading === 'create'}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--emerald-dark)',
              color: 'var(--white)',
              fontWeight: '700',
              cursor: actionLoading === 'create' ? 'not-allowed' : 'pointer',
              opacity: actionLoading === 'create' ? 0.6 : 1,
            }}
          >
            {actionLoading === 'create' ? '⏳' : 'Tambah'}
          </button>
        </div>
      </div>

      <div
        style={{
          background: 'var(--cream)',
          borderRadius: '16px',
          padding: '18px',
          border: '1px solid rgba(201, 150, 60, 0.2)',
        }}
      >
        <h3 style={{ fontSize: '15px', color: 'var(--emerald-dark)', marginBottom: '10px' }}>Daftar Kelas</h3>
        {classes.length === 0 ? (
          <p style={{ color: 'var(--ink-soft)' }}>Belum ada kelas terdaftar.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {classes.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'var(--parchment)',
                  border: '1px solid rgba(201, 150, 60, 0.2)',
                }}
              >
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1.5px solid rgba(201, 150, 60, 0.35)',
                      fontSize: '14px',
                    }}
                  />
                ) : (
                  <div style={{ flex: 1, fontWeight: '700', color: 'var(--ink)' }}>{item.name}</div>
                )}

                {editingId === item.id ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      disabled={actionLoading === item.id}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'rgba(26, 92, 69, 0.12)',
                        color: 'var(--emerald)',
                        fontWeight: '700',
                        cursor: actionLoading === item.id ? 'not-allowed' : 'pointer',
                        opacity: actionLoading === item.id ? 0.6 : 1,
                      }}
                    >
                      {actionLoading === item.id ? '⏳' : 'Simpan'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={actionLoading === item.id}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(120,120,120,0.25)',
                        background: 'transparent',
                        color: 'var(--ink-soft)',
                        fontWeight: '700',
                        cursor: actionLoading === item.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Batal
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(item)}
                      disabled={actionLoading === item.id}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'rgba(201, 150, 60, 0.15)',
                        color: 'var(--gold)',
                        fontWeight: '700',
                        cursor: actionLoading === item.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Ubah
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={actionLoading === item.id}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--red-soft)',
                        color: 'var(--red)',
                        fontWeight: '700',
                        cursor: actionLoading === item.id ? 'not-allowed' : 'pointer',
                        opacity: actionLoading === item.id ? 0.6 : 1,
                      }}
                    >
                      Hapus
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassManagement;
