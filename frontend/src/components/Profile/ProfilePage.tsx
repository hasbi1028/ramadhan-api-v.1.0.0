import React, { useEffect, useState } from 'react';
import { API_URL } from '../../config/env';

type User = {
  id: number;
  name: string;
  username: string;
  role: 'admin' | 'wali_kelas' | 'siswa';
  kelas?: string;
  verified: number;
};

interface ProfilePageProps {
  user: User;
  onUserUpdated: (nextUser: User) => void;
}

const getRoleLabel = (role: User['role']) => {
  if (role === 'siswa') return 'Siswa';
  if (role === 'wali_kelas') return 'Wali Kelas';
  return 'Administrator';
};

const getVerifiedLabel = (verified: number) => {
  if (verified === 1) return 'Terverifikasi';
  if (verified === 2) return 'Ditolak';
  return 'Menunggu Verifikasi';
};

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUserUpdated }) => {
  const [name, setName] = useState(user.name);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    setName(user.name);
  }, [user.name]);

  const saveProfile = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setProfileMessage('❌ Nama wajib diisi.');
      return;
    }

    setSavingProfile(true);
    setProfileMessage('');
    try {
      const token = localStorage.getItem('rm_token');
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: trimmedName }),
      });
      const result = await response.json();

      if (!response.ok) {
        setProfileMessage(`❌ ${result.error || 'Gagal memperbarui profil.'}`);
        return;
      }

      onUserUpdated(result.user as User);
      setProfileMessage('✅ Profil berhasil diperbarui.');
    } catch {
      setProfileMessage('❌ Terjadi kesalahan saat memperbarui profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!oldPassword.trim()) {
      setPasswordMessage('❌ Password lama wajib diisi.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage('❌ Password baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('❌ Konfirmasi password tidak sama.');
      return;
    }

    setSavingPassword(true);
    setPasswordMessage('');
    try {
      const token = localStorage.getItem('rm_token');
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setPasswordMessage(`❌ ${result.error || 'Gagal mengubah password.'}`);
        return;
      }

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('✅ Password berhasil diubah.');
    } catch {
      setPasswordMessage('❌ Terjadi kesalahan saat mengubah password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, var(--emerald-dark), var(--emerald))',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '20px',
          color: 'var(--white)',
        }}
      >
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', marginBottom: '8px' }}>👤 Profil</h2>
        <p style={{ fontSize: '13px', opacity: 0.9 }}>Kelola data akun dan keamanan akses Anda.</p>
      </div>

      <div
        style={{
          background: 'var(--cream)',
          borderRadius: '16px',
          border: '1px solid rgba(201, 150, 60, 0.2)',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ marginBottom: '12px', color: 'var(--emerald-dark)', fontSize: '16px' }}>Informasi Akun</h3>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700 }}>Nama</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={savingProfile}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1.5px solid rgba(201, 150, 60, 0.3)',
              fontSize: '14px',
            }}
          />
        </div>

        <ReadOnlyField label="Username" value={user.username} />
        <ReadOnlyField label="Role" value={getRoleLabel(user.role)} />
        <ReadOnlyField label="Kelas" value={user.kelas || '-'} />
        <ReadOnlyField label="Status Verifikasi" value={getVerifiedLabel(user.verified)} />

        <button
          onClick={saveProfile}
          disabled={savingProfile}
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
            color: 'var(--emerald-dark)',
            fontWeight: 800,
            cursor: savingProfile ? 'not-allowed' : 'pointer',
            opacity: savingProfile ? 0.7 : 1,
          }}
        >
          {savingProfile ? '⏳ Menyimpan...' : '💾 Simpan Perubahan Nama'}
        </button>
        {profileMessage && <p style={{ marginTop: '10px', fontSize: '13px', fontWeight: 700 }}>{profileMessage}</p>}
      </div>

      <div
        style={{
          background: 'var(--cream)',
          borderRadius: '16px',
          border: '1px solid rgba(201, 150, 60, 0.2)',
          padding: '16px',
        }}
      >
        <h3 style={{ marginBottom: '12px', color: 'var(--emerald-dark)', fontSize: '16px' }}>Ganti Password</h3>

        <Field
          label="Password Lama"
          value={oldPassword}
          onChange={setOldPassword}
          placeholder="Masukkan password lama"
          type="password"
          disabled={savingPassword}
        />
        <Field
          label="Password Baru"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Minimal 6 karakter"
          type="password"
          disabled={savingPassword}
        />
        <Field
          label="Konfirmasi Password Baru"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Ulangi password baru"
          type="password"
          disabled={savingPassword}
        />

        <button
          onClick={changePassword}
          disabled={savingPassword}
          style={{
            marginTop: '8px',
            padding: '10px 14px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--emerald-dark)',
            color: 'var(--white)',
            fontWeight: 800,
            cursor: savingPassword ? 'not-allowed' : 'pointer',
            opacity: savingPassword ? 0.7 : 1,
          }}
        >
          {savingPassword ? '⏳ Memproses...' : '🔐 Ubah Password'}
        </button>
        {passwordMessage && <p style={{ marginTop: '10px', fontSize: '13px', fontWeight: 700 }}>{passwordMessage}</p>}
      </div>
    </div>
  );
};

const ReadOnlyField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ marginBottom: '10px' }}>
    <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--ink-soft)' }}>
      {label}
    </label>
    <div
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: '10px',
        border: '1px solid rgba(201, 150, 60, 0.25)',
        background: 'var(--parchment)',
        fontSize: '13px',
        fontWeight: 600,
      }}
    >
      {value}
    </div>
  </div>
);

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  type: 'text' | 'password';
  disabled?: boolean;
}> = ({ label, value, onChange, placeholder, type, disabled }) => (
  <div style={{ marginBottom: '10px' }}>
    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700 }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: '10px',
        border: '1.5px solid rgba(201, 150, 60, 0.3)',
        fontSize: '14px',
      }}
    />
  </div>
);

export default ProfilePage;
