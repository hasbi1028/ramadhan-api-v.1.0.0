#!/usr/bin/env bun
/**
 * ═══════════════════════════════════════════════════════
 * Export Amaliah Data to CSV
 * ═══════════════════════════════════════════════════════
 * Usage: bun run scripts/export-amaliah.js
 * Output: exports/amaliah_export_YYYYMMDD_HHMMSS.csv
 */

import { Database } from 'bun:sqlite';
import { mkdirSync, writeFileSync } from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './app.db';
const EXPORT_DIR = './exports';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
const OUTPUT_FILE = `${EXPORT_DIR}/amaliah_export_${TIMESTAMP}.csv`;

console.log('💾 Database:', DB_PATH);
console.log('📁 Export directory:', EXPORT_DIR);

// Create exports directory
mkdirSync(EXPORT_DIR, { recursive: true });

// Open database
const db = new Database(DB_PATH);

// Get all amaliah records with user info
const records = db.query(`
  SELECT 
    a.day,
    u.name as student_name,
    u.username as student_username,
    u.kelas,
    a.checks,
    a.pages,
    a.catatan,
    a.parent_name,
    a.parent_verified,
    a.parent_verified_at
  FROM amaliah a
  JOIN users u ON a.user_id = u.id
  WHERE a.parent_verified = 1
  ORDER BY u.kelas, a.day, u.name
`).all();

console.log(`📊 Found ${records.length} verified records`);

// Parse checks JSON to columns
const IBADAH_KEYS = [
  'subuh', 'dzuhur', 'ashar', 'maghrib', 'isya',
  'sahur', 'buka', 'tarawih', 'witir', 'duha', 'tahajud', 'rawatib',
  'tadarus', 'hafalan', 'dzikir',
  'infaq', 'puasa', 'menahan', 'tilawatquran', 'berbakti'
];

// CSV Header
const header = [
  'Hari',
  'Nama Siswa',
  'Username',
  'Kelas',
  ...IBADAH_KEYS.map(k => `check_${k}`),
  'Halaman Qur\'an',
  'Catatan',
  'Nama Orang Tua',
  'Tanggal Verifikasi'
];

// CSV Rows
const rows = records.map(r => {
  const checks = JSON.parse(r.checks || '{}');
  
  return [
    r.day,
    `"${r.student_name}"`,
    r.student_username,
    r.kelas,
    ...IBADAH_KEYS.map(k => checks[k] ? '1' : '0'),
    r.pages,
    `"${(r.catatan || '').replace(/"/g, '""')}"`,
    `"${r.parent_name || ''}"`,
    r.parent_verified_at ? new Date(r.parent_verified_at).toISOString() : ''
  ].join(',');
});

// Write CSV
const csvContent = [header.join(','), ...rows].join('\n');
writeFileSync(OUTPUT_FILE, csvContent);

console.log('');
console.log('════════════════════════════════════════');
console.log(`✅ Export completed: ${OUTPUT_FILE}`);
console.log(`📊 Total records: ${records.length}`);
console.log('════════════════════════════════════════');

// Close database
db.close();
