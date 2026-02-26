import { Database } from "bun:sqlite";
import { DB_PATH } from "./config";

// Initialize SQLite database
export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency and performance
db.exec("PRAGMA journal_mode = WAL;");
// Foreign keys
db.exec("PRAGMA foreign_keys = ON;");

// Create schema
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'wali_kelas', 'siswa')),
      kelas TEXT,
      verified INTEGER DEFAULT 0, -- 0: pending, 1: approved, 2: rejected
      rejected_reason TEXT,
      must_change_password INTEGER DEFAULT 0 -- 0: false, 1: true
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS amaliah (
      user_id INTEGER NOT NULL,
      day INTEGER NOT NULL,
      checks TEXT DEFAULT '{}',
      pages INTEGER DEFAULT 0,
      catatan TEXT,
      tema_tarawih TEXT,
      tema_kultum_subuh TEXT,
      parent_verified INTEGER DEFAULT 0, -- 0: belum, 1: sudah diverifikasi
      parent_name TEXT,
      parent_signature TEXT, -- base64 signature atau checkbox confirmation
      parent_verified_at TEXT,
      PRIMARY KEY (user_id, day),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe migration for existing databases
  const amaliahCols = db.query("PRAGMA table_info(amaliah)").all() as Array<{ name: string }>;
  const hasTemaTarawih = amaliahCols.some((c) => c.name === 'tema_tarawih');
  const hasTemaKultumSubuh = amaliahCols.some((c) => c.name === 'tema_kultum_subuh');

  if (!hasTemaTarawih) {
    db.exec("ALTER TABLE amaliah ADD COLUMN tema_tarawih TEXT;");
  }

  if (!hasTemaKultumSubuh) {
    db.exec("ALTER TABLE amaliah ADD COLUMN tema_kultum_subuh TEXT;");
  }

  // Bootstrap classes from existing users.kelas data
  const existingUserClasses = db
    .query("SELECT DISTINCT kelas FROM users WHERE kelas IS NOT NULL AND TRIM(kelas) != ''")
    .all() as Array<{ kelas: string }>;

  for (const row of existingUserClasses) {
    db.run(
      "INSERT OR IGNORE INTO classes (name, is_active) VALUES ($name, 1)",
      { $name: row.kelas.trim() }
    );
  }

  console.log("Database schema initialized.");

  // Check if admin exists, if not, create default admin
  const adminRow = db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
  if (adminRow.count === 0) {
      // In production, we'd hash this. For the prototype we'll hash it inside the route if needed, 
      // but Bun actually provides a fast way: await Bun.password.hash
      // We will do that via a setup script or during first start.
      console.log("No admin found. Default admin must be created programmatically.");
  }
}
