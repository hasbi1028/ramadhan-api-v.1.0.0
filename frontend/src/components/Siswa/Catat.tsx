/**
 * ═══════════════════════════════════════════════════════
 * Siswa Catat Component - Daily Activities
 * ═══════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/env';
import { useToast } from '../../hooks/useToast';
import SignatureCanvas from 'react-signature-canvas';

interface Checks {
  [key: string]: boolean;
}

interface AmaliahData {
  checks: Checks;
  pages: number;
  catatan: string;
  parent_verified?: number;
  parent_name?: string;
  parent_signature?: string;
}

interface CatatProps {
  user: any;
}

const IBADAH = {
  sholat: [
    { id: 'subuh', label: 'Sholat Subuh (Berjamaah)', pts: 3 },
    { id: 'dzuhur', label: 'Sholat Dzuhur', pts: 2 },
    { id: 'ashar', label: 'Sholat Ashar', pts: 2 },
    { id: 'maghrib', label: 'Sholat Maghrib (Berjamaah)', pts: 3 },
    { id: 'isya', label: 'Sholat Isya (Berjamaah)', pts: 3 },
  ],
  sunnah: [
    { id: 'sahur', label: 'Makan Sahur', pts: 2 },
    { id: 'buka', label: 'Berbuka tepat waktu', pts: 2 },
    { id: 'tarawih', label: 'Sholat Tarawih', pts: 3 },
    { id: 'witir', label: 'Sholat Witir', pts: 2 },
    { id: 'duha', label: 'Sholat Dhuha', pts: 2 },
    { id: 'tahajud', label: 'Sholat Tahajud', pts: 3 },
    { id: 'rawatib', label: 'Sholat Sunnah Rawatib', pts: 2 },
  ],
  tadarus: [
    { id: 'tadarus', label: "Membaca Al-Qur'an", pts: 3 },
    { id: 'hafalan', label: "Menghafal/Muraja'ah", pts: 3 },
    { id: 'dzikir', label: 'Dzikir Pagi & Petang', pts: 2 },
  ],
  akhlak: [
    { id: 'infaq', label: 'Infaq / Sedekah', pts: 3 },
    { id: 'puasa', label: 'Puasa Penuh (tdk batal)', pts: 5 },
    { id: 'menahan', label: 'Menjaga Lisan & Perilaku', pts: 3 },
    { id: 'tilawatquran', label: 'Menyimak kajian/ceramah', pts: 2 },
    { id: 'berbakti', label: 'Berbakti kepada Orang Tua', pts: 2 },
  ],
};

const Catat: React.FC<CatatProps> = ({ user }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [data, setData] = useState<AmaliahData>({
    checks: {},
    pages: 0,
    catatan: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parentName, setParentName] = useState('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  
  const toast = useToast();

  // Load data for selected day
  useEffect(() => {
    loadDayData(selectedDay);
  }, [selectedDay]);

  const loadDayData = async (day: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rm_token');
      const response = await fetch(`${API_URL}/amaliah`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      
      if (result.data && result.data[day]) {
        setData(result.data[day]);
      } else {
        setData({ checks: {}, pages: 0, catatan: '' });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (id: string) => {
    setData(prev => ({
      ...prev,
      checks: {
        ...prev.checks,
        [id]: !prev.checks[id],
      },
    }));
  };

  const handleSave = async () => {
    // Validate parent verification
    if (!parentName.trim()) {
      toast.warning('Nama orang tua/wali harus diisi!');
      return;
    }
    
    if (!signatureData) {
      toast.warning('Tanda tangan orang tua/wali harus diisi!');
      return;
    }

    setSaving(true);
    
    try {
      const token = localStorage.getItem('rm_token');
      const payload = {
        ...data,
        parent_verified: 1,
        parent_name: parentName,
        parent_signature: signatureData,
      };
      
      const response = await fetch(`${API_URL}/amaliah/${selectedDay}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('✅ Hari ke-' + selectedDay + ' tersimpan & diverifikasi!');
      } else {
        toast.error('❌ ' + (result.error || 'Gagal menyimpan'));
      }
    } catch (error) {
      toast.error('❌ Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

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
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', marginBottom: '8px' }}>
          ✏️ Catat Kegiatan
        </h2>
        <p style={{ fontSize: '13px', opacity: 0.9 }}>
          {user.name} - Kelas {user.kelas}
        </p>
      </div>

      {/* Day Selector */}
      <div style={{ 
        background: 'var(--emerald)',
        borderRadius: '16px',
        padding: '14px',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase' }}>
          Pilih Hari Ramadhan
        </div>
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
                background: selectedDay === day ? 'var(--emerald-dark)' : 'var(--cream)',
                color: selectedDay === day ? 'var(--white)' : 'var(--emerald-dark)',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '10px',
          marginBottom: '20px',
          fontWeight: '600',
        }}>
          {message}
        </div>
      )}

      {/* Checklists */}
      <div style={{ marginBottom: '20px' }}>
        <ChecklistSection
          title="🕌 Sholat Fardhu"
          items={IBADAH.sholat}
          checks={data.checks}
          onToggle={toggleCheck}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <ChecklistSection
          title="🌙 Ibadah Sunnah"
          items={IBADAH.sunnah}
          checks={data.checks}
          onToggle={toggleCheck}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <ChecklistSection
          title="📖 Tadarus Al-Qur'an"
          items={IBADAH.tadarus}
          checks={data.checks}
          onToggle={toggleCheck}
        />
        
        {/* Quran Pages */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          background: 'var(--parchment)',
          borderRadius: '10px',
          marginTop: '10px',
        }}>
          <label style={{ fontSize: '13px', fontWeight: '600', flex: 1 }}>
            Halaman dibaca hari ini
          </label>
          <input
            type="number"
            value={data.pages}
            onChange={(e) => setData({ ...data, pages: parseInt(e.target.value) || 0 })}
            min="0"
            max="604"
            style={{
              width: '60px',
              padding: '6px 8px',
              borderRadius: '8px',
              border: '1.5px solid var(--gold)',
              textAlign: 'center',
              fontWeight: '700',
            }}
          />
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>hal.</span>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <ChecklistSection
          title="❤️ Akhlak & Sosial"
          items={IBADAH.akhlak}
          checks={data.checks}
          onToggle={toggleCheck}
        />
      </div>

      {/* Catatan */}
      <div style={{ marginBottom: '20px' }}>
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
            📝 Catatan Harian
          </h3>
          <textarea
            value={data.catatan}
            onChange={(e) => setData({ ...data, catatan: e.target.value })}
            placeholder="Tulis refleksi atau doa hari ini..."
            rows={4}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1.5px solid rgba(201, 150, 60, 0.3)',
              fontFamily: 'inherit',
              fontSize: '13px',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Parent Verification */}
      <div style={{
        background: 'var(--cream)',
        borderRadius: '16px',
        padding: '18px',
        border: '2px solid rgba(26, 92, 69, 0.2)',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: '1px dashed rgba(201, 150, 60, 0.2)',
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--emerald-dark)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            👨‍👩‍👧 Verifikasi Orang Tua/Wali
          </div>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '9px',
            fontWeight: '800',
            background: 'rgba(26, 92, 69, 0.12)',
            color: 'var(--emerald)',
            border: '1px solid rgba(26, 92, 69, 0.3)',
          }}>
            ✅ WAJIB DIISI
          </span>
        </div>
        
        <p style={{ fontSize: '11px', color: 'var(--ink-soft)', marginBottom: '12px' }}>
          Setelah menyimpan kegiatan, orang tua/wali perlu memverifikasi dengan tanda tangan digital.
        </p>

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--ink-soft)',
            marginBottom: '6px',
            textTransform: 'uppercase',
          }}>
            Nama Orang Tua/Wali
          </label>
          <input
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Nama lengkap orang tua/wali"
            style={{
              width: '100%',
              padding: '11px 13px',
              borderRadius: '10px',
              border: '1.5px solid rgba(201, 150, 60, 0.25)',
              fontSize: '14px',
            }}
          />
        </div>

        {/* Signature Canvas */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--ink-soft)',
            marginBottom: '6px',
            textTransform: 'uppercase',
          }}>
            ✍️ Tanda Tangan Orang Tua/Wali
          </label>
          <div style={{
            background: '#fff',
            borderRadius: '10px',
            border: '2px dashed rgba(201, 150, 60, 0.35)',
            overflow: 'hidden',
          }}>
            <SignatureCanvas
              ref={(ref) => {
                if (ref) {
                  // Store reference if needed
                }
              }}
              onEnd={() => {
                const canvas = document.querySelector('.signature-canvas') as HTMLCanvasElement;
                if (canvas) {
                  setSignatureData(canvas.toDataURL('image/png'));
                }
              }}
              canvasProps={{
                className: 'signature-canvas',
                style: {
                  width: '100%',
                  height: '140px',
                  touchAction: 'none',
                }
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={() => {
                const canvas = document.querySelector('.signature-canvas') as HTMLCanvasElement;
                if (canvas) {
                  const ctx = canvas.getContext('2d');
                  ctx?.clearRect(0, 0, canvas.width, canvas.height);
                  setSignatureData(null);
                  toast.info('Tanda tangan dihapus');
                }
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1.5px solid rgba(201, 150, 60, 0.3)',
                background: 'var(--parchment)',
                color: 'var(--ink)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              🗑️ Hapus TTD
            </button>
          </div>
          {signatureData && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--emerald)', fontWeight: '600' }}>
              ✅ Tanda tangan tersimpan
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || loading}
        style={{
          display: 'block',
          width: '100%',
          padding: '13px',
          background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
          color: 'var(--emerald-dark)',
          border: 'none',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: '800',
          cursor: saving || loading ? 'not-allowed' : 'pointer',
          opacity: saving || loading ? 0.6 : 1,
          boxShadow: '0 4px 16px rgba(201, 150, 60, 0.35)',
        }}
      >
        {saving ? '⏳ Menyimpan...' : '💾 Simpan Hari Ini'}
      </button>

      <div style={{ height: '14px' }} />
    </div>
  );
};

// Checklist Section Component
const ChecklistSection: React.FC<{
  title: string;
  items: Array<{ id: string; label: string; pts: number }>;
  checks: Checks;
  onToggle: (id: string) => void;
}> = ({ title, items, checks, onToggle }) => {
  return (
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
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => onToggle(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              background: 'var(--parchment)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.18s',
              ...(checks[item.id] ? {
                background: 'rgba(26, 92, 69, 0.08)',
                border: '1px solid var(--emerald-light)',
              } : {}),
            }}
          >
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              border: '2px solid #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              transition: 'all 0.18s',
              ...(checks[item.id] ? {
                background: 'var(--emerald)',
                borderColor: 'var(--emerald)',
                color: 'var(--white)',
              } : {}),
            }}>
              {checks[item.id] ? '✓' : ''}
            </div>
            <div style={{ flex: 1, fontSize: '13px', fontWeight: '600' }}>
              {item.label}
            </div>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--gold)',
              background: 'rgba(201, 150, 60, 0.12)',
              padding: '2px 6px',
              borderRadius: '20px',
            }}>
              +{item.pts}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catat;
