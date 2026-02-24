#!/usr/bin/env bun
/**
 * ═══════════════════════════════════════════════════════
 * Import Students from CSV
 * ═══════════════════════════════════════════════════════
 * Usage: bun run scripts/import-students.js students.csv
 * 
 * CSV Format:
 * name,username,password,role,kelas
 * Ahmad Abdullah,ahmad7A,password123,siswa,7A
 * Fatimah Zahra,fatimah7A,password123,siswa,7A
 */

import { Database } from 'bun:sqlite';
import { readFileSync } from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './app.db';
const CSV_FILE = process.argv[2];

if (!CSV_FILE) {
  console.error('❌ Usage: bun run scripts/import-students.js <csv-file>');
  console.error('Example: bun run scripts/import-students.js students.csv');
  process.exit(1);
}

console.log('📖 Importing students from:', CSV_FILE);
console.log('💾 Database:', DB_PATH);

// Read CSV
const csvContent = readFileSync(CSV_FILE, 'utf-8');
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');

console.log('📋 Headers:', headers.join(', '));

// Open database
const db = new Database(DB_PATH);

// Prepare insert statement
const insertStmt = db.prepare(`
  INSERT INTO users (name, username, password, role, kelas, verified, must_change_password)
  VALUES ($name, $username, $password, $role, $kelas, $verified, $must_change_password)
`);

let successCount = 0;
let errorCount = 0;

// Process each line (skip header)
for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',');
  
  if (values.length < 5) {
    console.error(`⚠️  Line ${i + 1}: Not enough columns, skipping`);
    errorCount++;
    continue;
  }

  const [name, username, password, role, kelas] = values;

  try {
    // Check if username exists
    const existing = db.query('SELECT id FROM users WHERE username = $username').get({ $username: username });
    
    if (existing) {
      console.error(`⚠️  Line ${i + 1}: Username ${username} already exists, skipping`);
      errorCount++;
      continue;
    }

    // Hash password
    const hashedPassword = await Bun.password.hash(password || 'password123');

    // Insert user
    insertStmt.run({
      $name: name.trim(),
      $username: username.trim(),
      $password: hashedPassword,
      $role: role.trim() || 'siswa',
      $kelas: kelas.trim(),
      $verified: 1,
      $must_change_password: 1
    });

    console.log(`✅ ${i + 1}. ${name.trim()} (${username.trim()}) - Kelas ${kelas.trim()}`);
    successCount++;

  } catch (err) {
    console.error(`❌ Line ${i + 1}: Error - ${err.message}`);
    errorCount++;
  }
}

console.log('');
console.log('════════════════════════════════════════');
console.log(`✅ Success: ${successCount} students imported`);
console.log(`❌ Errors: ${errorCount} students failed`);
console.log('════════════════════════════════════════');

// Close database
db.close();
