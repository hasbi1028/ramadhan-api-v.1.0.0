#!/usr/bin/env bun
/**
 * ═══════════════════════════════════════════════════════
 * Cleanup Test Data Before Production
 * ═══════════════════════════════════════════════════════
 * Usage: bun run scripts/cleanup-test-data.js
 * 
 * ⚠️  WARNING: This will DELETE all test users and data!
 * Make sure to backup first!
 */

import { Database } from 'bun:sqlite';
import { readFileSync } from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './app.db';

console.log('⚠️  WARNING: This will delete all test data!');
console.log('💾 Database:', DB_PATH);
console.log('');

// Confirm
const confirm = prompt('Are you sure? Type "YES" to confirm: ');
if (confirm !== 'YES') {
  console.log('❌ Cancelled');
  process.exit(0);
}

// Backup first
console.log('💾 Creating backup...');
const { execSync } = require('child_process');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
const BACKUP_FILE = `./app_backup_${TIMESTAMP}.db`;

try {
  execSync(`cp ${DB_PATH} ${BACKUP_FILE}`);
  console.log(`✅ Backup created: ${BACKUP_FILE}`);
} catch (err) {
  console.error('❌ Backup failed:', err.message);
  process.exit(1);
}

// Open database
const db = new Database(DB_PATH);

console.log('');
console.log('🗑️  Cleaning up test data...');

// Delete test users (pattern matching)
const testPatterns = ['%test%', '%siswatest%', '%walitest%'];
let deletedUsers = 0;

for (const pattern of testPatterns) {
  const result = db.run('DELETE FROM users WHERE username LIKE ?', [pattern]);
  deletedUsers += result.changes;
  console.log(`  Deleted users matching "${pattern}": ${result.changes}`);
}

// Delete orphaned amaliah records
const orphanedResult = db.run(`
  DELETE FROM amaliah 
  WHERE user_id NOT IN (SELECT id FROM users)
`);
console.log(`  Deleted orphaned amaliah records: ${orphanedResult.changes}`);

// Vacuum database
console.log('🧹 Optimizing database...');
db.exec('VACUUM');

// Show remaining users
const remainingUsers = db.query('SELECT role, COUNT(*) as count FROM users GROUP BY role').all();
console.log('');
console.log('📊 Remaining users:');
remainingUsers.forEach(u => {
  console.log(`  ${u.role}: ${u.count}`);
});

// Close database
db.close();

console.log('');
console.log('════════════════════════════════════════');
console.log('✅ Cleanup completed!');
console.log(`💾 Backup saved at: ${BACKUP_FILE}`);
console.log('════════════════════════════════════════');
