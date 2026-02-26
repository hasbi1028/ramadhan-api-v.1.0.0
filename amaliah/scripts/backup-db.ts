#!/usr/bin/env bun
/**
 * ═══════════════════════════════════════════════════════
 * Database Backup Script
 * ═══════════════════════════════════════════════════════
 * Automated backup with rotation
 */

import { mkdir, cp, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const BACKUP_DIR = process.env.BACKUP_DIR || '/home/amaliah/backups';
const DB_PATH = process.env.DATABASE_URL || 'local.db';
const MAX_BACKUPS = parseInt(process.env.MAX_BACKUPS || '7');

async function rotateBackups() {
  try {
    const files = await readdir(BACKUP_DIR);
    const dbBackups = files
      .filter((f) => f.endsWith('.db'))
      .sort();

    if (dbBackups.length > MAX_BACKUPS) {
      const toDelete = dbBackups.slice(0, dbBackups.length - MAX_BACKUPS);
      for (const file of toDelete) {
        await unlink(join(BACKUP_DIR, file));
        console.log(`🗑️  Deleted old backup: ${file}`);
      }
    }
  } catch (error) {
    console.error('❌ Rotation failed:', error);
  }
}

async function backup() {
  const date = new Date();
  const timestamp = date.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + date.toTimeString().split(' ')[0].replace(/:/g, '');
  const backupFile = join(BACKUP_DIR, `amaliah_${timestamp}.db`);

  console.log('🚀 Starting database backup...');
  console.log(`📁 Source: ${DB_PATH}`);
  console.log(`📁 Destination: ${backupFile}`);

  try {
    // Create backup directory if not exists
    await mkdir(BACKUP_DIR, { recursive: true });

    // Copy database file
    await cp(DB_PATH, backupFile);

    console.log(`✅ Backup successful: ${backupFile}`);
    console.log(`📊 Backup size: ${(await Bun.file(backupFile).size / 1024 / 1024).toFixed(2)} MB`);

    // Rotate old backups
    await rotateBackups();

    console.log('✨ Backup complete!');
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

backup();
