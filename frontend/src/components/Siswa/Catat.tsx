/**
 * ═══════════════════════════════════════════════════════
 * Siswa Catat Component - Daily Activities
 * ═══════════════════════════════════════════════════════
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { API_URL } from '../../config/env';
import { useToast } from '../../hooks/useToast';

interface Checks {
  [key: string]: boolean;
}

interface AmaliahData {
  checks: Checks;
  pages: number;
  catatan: string;
  tema_tarawih?: string;
  tema_kultum_subuh?: string;
  parent_verified?: number;
  parent_name?: string;
  parent_signature?: string;
}

interface CatatProps {
  user: any;
}

type SectionId =
  | 'day'
  | 'sholat'
  | 'sunnah'
  | 'tadarus'
  | 'akhlak'
  | 'tema'
  | 'catatan'
  | 'verifikasi';

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
  const [openSection, setOpenSection] = useState<SectionId>('day');
  const [data, setData] = useState<AmaliahData>({
    checks: {},
    pages: 0,
    catatan: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parentName, setParentName] = useState('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const toast = useToast();

  const isParentVerificationLocked = data.parent_verified === 1;
  const isFormLocked = data.parent_verified === 1;
  const isLockedSignatureMissing = isParentVerificationLocked && !signatureData;

  const toggleSection = (id: SectionId) => {
    setOpenSection((prev) => (prev === id ? ('' as SectionId) : id));
  };

  useEffect(() => {
    loadDayData(selectedDay);
  }, [selectedDay]);

  const loadDayData = async (day: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rm_token');
      const response = await fetch(`${API_URL}/amaliah`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (result.data && result.data[day]) {
        const dayData = result.data[day] as AmaliahData;
        setData(dayData);
        setParentName(dayData.parent_name || '');
        setSignatureData(dayData.parent_signature || null);
      } else {
        setData({ checks: {}, pages: 0, catatan: '', tema_tarawih: '', tema_kultum_subuh: '' });
        setParentName('');
        setSignatureData(null);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('❌ Gagal memuat data hari ini');
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (id: string) => {
    if (isFormLocked) return;
    setData((prev) => ({
      ...prev,
      checks: {
        ...prev.checks,
        [id]: !prev.checks[id],
      },
    }));
  };

  const clearSignature = () => {
    if (isParentVerificationLocked) return;
    signatureRef.current?.clear();
    setSignatureData(null);
    toast.info('Tanda tangan dihapus');
  };

  const handleSave = async () => {
    if (isFormLocked) {
      toast.info('Data hari ini sudah terkunci. Minta izin Wali Kelas untuk reset verifikasi.');
      return;
    }

    if (!isParentVerificationLocked) {
      if (!parentName.trim()) {
        toast.warning('Nama orang tua/wali harus diisi!');
        return;
      }
      if (!signatureData) {
        toast.warning('Tanda tangan orang tua/wali harus diisi!');
        return;
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('rm_token');

      const payload = {
        ...data,
        parent_verified: 1,
        parent_name: isParentVerificationLocked ? (data.parent_name || parentName) : parentName,
        parent_signature: isParentVerificationLocked ? (data.parent_signature || signatureData) : signatureData,
      };

      const response = await fetch(`${API_URL}/amaliah/${selectedDay}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(`✅ Hari ke-${selectedDay} tersimpan & diverifikasi!`);
        await loadDayData(selectedDay);
      } else {
        toast.error('❌ ' + (result.error || 'Gagal menyimpan'));
      }
    } catch {
      toast.error('❌ Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const verificationBadge = useMemo(() => {
    if (isParentVerificationLocked) return '🔒 TERKUNCI';
    return '✅ WAJIB DIISI';
  }, [isParentVerificationLocked]);

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
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', marginBottom: '8px' }}>
          ✏️ Catat Kegiatan
        </h2>
        <p style={{ fontSize: '13px', opacity: 0.9 }}>
          {user.name} - Kelas {user.kelas}
        </p>
      </div>

      <AccordionSection
        id="day"
        title="📅 Pilih Hari Ramadhan"
        isOpen={openSection === 'day'}
        onToggle={toggleSection}
        rightBadge={isFormLocked ? '🔒 READ ONLY' : undefined}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: '6px',
          }}
        >
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
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
      </AccordionSection>

      <AccordionSection
        id="sholat"
        title="🕌 Sholat Fardhu"
        isOpen={openSection === 'sholat'}
        onToggle={toggleSection}
      >
        <ChecklistSection title="Sholat Fardhu" items={IBADAH.sholat} checks={data.checks} onToggle={toggleCheck} hideTitle disabled={isFormLocked} />
      </AccordionSection>

      <AccordionSection
        id="sunnah"
        title="🌙 Ibadah Sunnah"
        isOpen={openSection === 'sunnah'}
        onToggle={toggleSection}
      >
        <ChecklistSection title="Ibadah Sunnah" items={IBADAH.sunnah} checks={data.checks} onToggle={toggleCheck} hideTitle disabled={isFormLocked} />
      </AccordionSection>

      <AccordionSection
        id="tadarus"
        title="📖 Tadarus Al-Qur'an"
        isOpen={openSection === 'tadarus'}
        onToggle={toggleSection}
      >
        <ChecklistSection
          title="Tadarus Al-Qur'an"
          items={IBADAH.tadarus}
          checks={data.checks}
          onToggle={toggleCheck}
          hideTitle
          disabled={isFormLocked}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            background: 'var(--parchment)',
            borderRadius: '10px',
            marginTop: '10px',
          }}
        >
          <label style={{ fontSize: '13px', fontWeight: '600', flex: 1 }}>Halaman dibaca hari ini</label>
          <input
            type="number"
            value={data.pages}
            onChange={(e) => setData({ ...data, pages: parseInt(e.target.value, 10) || 0 })}
            min="0"
            max="604"
            disabled={isFormLocked}
            style={{
              width: '60px',
              padding: '6px 8px',
              borderRadius: '8px',
              border: '1.5px solid var(--gold)',
              textAlign: 'center',
              fontWeight: '700',
              opacity: isFormLocked ? 0.65 : 1,
            }}
          />
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>hal.</span>
        </div>
      </AccordionSection>

      <AccordionSection
        id="akhlak"
        title="❤️ Akhlak & Sosial"
        isOpen={openSection === 'akhlak'}
        onToggle={toggleSection}
      >
        <ChecklistSection title="Akhlak & Sosial" items={IBADAH.akhlak} checks={data.checks} onToggle={toggleCheck} hideTitle disabled={isFormLocked} />
      </AccordionSection>

      <AccordionSection
        id="tema"
        title="🎤 Tema Kajian"
        isOpen={openSection === 'tema'}
        onToggle={toggleSection}
      >
        <div style={{ marginBottom: '12px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--ink-soft)',
              marginBottom: '6px',
              textTransform: 'uppercase',
            }}
          >
            Tema Ceramah Tarawih
          </label>
          <textarea
            value={data.tema_tarawih || ''}
            onChange={(e) => setData({ ...data, tema_tarawih: e.target.value })}
            placeholder="Contoh: Keutamaan Qiyam Ramadhan"
            rows={2}
            disabled={isFormLocked}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1.5px solid rgba(201, 150, 60, 0.3)',
              fontFamily: 'inherit',
              fontSize: '13px',
              resize: 'vertical',
              outline: 'none',
              opacity: isFormLocked ? 0.65 : 1,
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--ink-soft)',
              marginBottom: '6px',
              textTransform: 'uppercase',
            }}
          >
            Tema Kultum Subuh
          </label>
          <textarea
            value={data.tema_kultum_subuh || ''}
            onChange={(e) => setData({ ...data, tema_kultum_subuh: e.target.value })}
            placeholder="Contoh: Menjaga Lisan di Bulan Ramadhan"
            rows={2}
            disabled={isFormLocked}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1.5px solid rgba(201, 150, 60, 0.3)',
              fontFamily: 'inherit',
              fontSize: '13px',
              resize: 'vertical',
              outline: 'none',
              opacity: isFormLocked ? 0.65 : 1,
            }}
          />
        </div>
      </AccordionSection>

      <AccordionSection
        id="catatan"
        title="📝 Catatan Harian"
        isOpen={openSection === 'catatan'}
        onToggle={toggleSection}
      >
        <textarea
          value={data.catatan}
          onChange={(e) => setData({ ...data, catatan: e.target.value })}
          placeholder="Tulis refleksi atau doa hari ini..."
          rows={4}
          disabled={isFormLocked}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1.5px solid rgba(201, 150, 60, 0.3)',
            fontFamily: 'inherit',
            fontSize: '13px',
            resize: 'vertical',
            outline: 'none',
            opacity: isFormLocked ? 0.65 : 1,
          }}
        />
      </AccordionSection>

      <AccordionSection
        id="verifikasi"
        title="👨‍👩‍👧 Verifikasi Orang Tua/Wali"
        isOpen={openSection === 'verifikasi'}
        onToggle={toggleSection}
        rightBadge={verificationBadge}
      >
        <p style={{ fontSize: '11px', color: 'var(--ink-soft)', marginBottom: '12px' }}>
          Setelah menyimpan kegiatan, orang tua/wali perlu memverifikasi dengan tanda tangan digital.
        </p>

        {isParentVerificationLocked && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(201, 150, 60, 0.15)',
              border: '1px solid rgba(201, 150, 60, 0.35)',
              color: 'var(--ink)',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '12px',
            }}
          >
            Verifikasi sudah dikunci. Jika ingin dibatalkan/diubah, minta izin ke Wali Kelas untuk reset verifikasi.
          </div>
        )}

        {isFormLocked && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(26, 92, 69, 0.08)',
              border: '1px solid rgba(26, 92, 69, 0.2)',
              color: 'var(--emerald-dark)',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '12px',
            }}
          >
            Seluruh data ibadah hari ini bersifat read-only setelah verifikasi orang tua.
          </div>
        )}

        {isLockedSignatureMissing && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'var(--red-soft)',
              border: '1px solid rgba(192, 57, 43, 0.3)',
              color: 'var(--red)',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '12px',
            }}
          >
            Data verifikasi belum lengkap. Hubungi Wali Kelas untuk bantuan.
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--ink-soft)',
              marginBottom: '6px',
              textTransform: 'uppercase',
            }}
          >
            Nama Orang Tua/Wali
          </label>
          <input
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Nama lengkap orang tua/wali"
            disabled={isParentVerificationLocked}
            style={{
              width: '100%',
              padding: '11px 13px',
              borderRadius: '10px',
              border: '1.5px solid rgba(201, 150, 60, 0.25)',
              fontSize: '14px',
              opacity: isParentVerificationLocked ? 0.65 : 1,
            }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--ink-soft)',
              marginBottom: '6px',
              textTransform: 'uppercase',
            }}
          >
            ✍️ Tanda Tangan Orang Tua/Wali
          </label>
          <div
            style={{
              background: '#fff',
              borderRadius: '10px',
              border: '2px dashed rgba(201, 150, 60, 0.35)',
              overflow: 'hidden',
              opacity: isParentVerificationLocked ? 0.65 : 1,
              pointerEvents: isParentVerificationLocked ? 'none' : 'auto',
            }}
          >
            <SignatureCanvas
              ref={(ref) => {
                signatureRef.current = ref;
              }}
              onEnd={() => {
                if (isParentVerificationLocked) return;
                const canvas = signatureRef.current;
                if (canvas && !canvas.isEmpty()) {
                  setSignatureData(canvas.toDataURL('image/png'));
                }
              }}
              canvasProps={{
                className: 'signature-canvas',
                style: {
                  width: '100%',
                  height: '140px',
                  touchAction: 'none',
                },
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={clearSignature}
              disabled={isParentVerificationLocked}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1.5px solid rgba(201, 150, 60, 0.3)',
                background: 'var(--parchment)',
                color: 'var(--ink)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: isParentVerificationLocked ? 'not-allowed' : 'pointer',
                opacity: isParentVerificationLocked ? 0.6 : 1,
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
      </AccordionSection>

      <button
        onClick={handleSave}
        disabled={saving || loading || isFormLocked}
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
          cursor: saving || loading || isFormLocked ? 'not-allowed' : 'pointer',
          opacity: saving || loading || isFormLocked ? 0.6 : 1,
          boxShadow: '0 4px 16px rgba(201, 150, 60, 0.35)',
        }}
      >
        {saving ? '⏳ Menyimpan...' : isFormLocked ? '🔒 Terkunci - Menunggu reset Wali Kelas' : '💾 Simpan Hari Ini'}
      </button>

      <div style={{ height: '14px' }} />
    </div>
  );
};

const AccordionSection: React.FC<{
  id: SectionId;
  title: string;
  isOpen: boolean;
  onToggle: (id: SectionId) => void;
  rightBadge?: string;
  children: React.ReactNode;
}> = ({ id, title, isOpen, onToggle, rightBadge, children }) => {
  return (
    <div
      style={{
        background: 'var(--cream)',
        borderRadius: '16px',
        border: '1px solid rgba(201, 150, 60, 0.2)',
        marginBottom: '14px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => onToggle(id)}
        style={{
          width: '100%',
          border: 'none',
          background: 'var(--cream)',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--emerald-dark)', fontWeight: '800', fontSize: '14px' }}>{title}</span>
          {rightBadge && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '20px',
                fontSize: '9px',
                fontWeight: '800',
                background: 'rgba(26, 92, 69, 0.12)',
                color: 'var(--emerald)',
                border: '1px solid rgba(26, 92, 69, 0.3)',
              }}
            >
              {rightBadge}
            </span>
          )}
        </div>
        <span style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>{isOpen ? '▾' : '▸'}</span>
      </button>

      {isOpen && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ borderTop: '1px dashed rgba(201, 150, 60, 0.2)', paddingTop: '12px' }}>{children}</div>
        </div>
      )}
    </div>
  );
};

const ChecklistSection: React.FC<{
  title: string;
  items: Array<{ id: string; label: string; pts: number }>;
  checks: Checks;
  onToggle: (id: string) => void;
  hideTitle?: boolean;
  disabled?: boolean;
}> = ({ title, items, checks, onToggle, hideTitle, disabled }) => {
  return (
    <div>
      {!hideTitle && (
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '15px',
            color: 'var(--emerald-dark)',
            marginBottom: '12px',
          }}
        >
          {title}
        </h3>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (!disabled) onToggle(item.id);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              background: 'var(--parchment)',
              borderRadius: '10px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.18s',
              opacity: disabled ? 0.65 : 1,
              ...(checks[item.id]
                ? {
                    background: 'rgba(26, 92, 69, 0.08)',
                    border: '1px solid var(--emerald-light)',
                  }
                : {}),
            }}
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                border: '2px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                transition: 'all 0.18s',
                ...(checks[item.id]
                  ? {
                      background: 'var(--emerald)',
                      borderColor: 'var(--emerald)',
                      color: 'var(--white)',
                    }
                  : {}),
              }}
            >
              {checks[item.id] ? '✓' : ''}
            </div>
            <div style={{ flex: 1, fontSize: '13px', fontWeight: '600' }}>{item.label}</div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--gold)',
                background: 'rgba(201, 150, 60, 0.12)',
                padding: '2px 6px',
                borderRadius: '20px',
              }}
            >
              +{item.pts}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catat;
