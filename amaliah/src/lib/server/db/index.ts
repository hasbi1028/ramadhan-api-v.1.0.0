import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { count, eq } from 'drizzle-orm';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = new Database(env.DATABASE_URL);

// Enable WAL mode for better performance
client.exec('PRAGMA journal_mode = WAL;');
// Enable foreign keys
client.exec('PRAGMA foreign_keys = ON;');

export const db = drizzle(client, { schema });

/**
 * Initialize database schema and run migrations
 */
export function initDB() {
	client.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			username TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL,
			role TEXT NOT NULL,
			kelas TEXT,
			verified INTEGER NOT NULL DEFAULT 0,
			rejected_reason TEXT,
			must_change_password INTEGER NOT NULL DEFAULT 0
		);

		CREATE TABLE IF NOT EXISTS classes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL UNIQUE,
			is_active INTEGER NOT NULL DEFAULT 1,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS amaliah (
			user_id INTEGER NOT NULL,
			day INTEGER NOT NULL,
			checks TEXT NOT NULL DEFAULT '{}',
			pages INTEGER NOT NULL DEFAULT 0,
			catatan TEXT NOT NULL DEFAULT '',
			tema_tarawih TEXT,
			tema_kultum_subuh TEXT,
			parent_verified INTEGER NOT NULL DEFAULT 0,
			parent_name TEXT,
			parent_signature TEXT,
			parent_verified_at TEXT,
			PRIMARY KEY (user_id, day),
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);
	`);

	console.log('Database initialized with WAL mode and foreign keys enabled');
}

/**
 * Bootstrap default admin user if none exists
 */
export async function bootstrapAdmin() {
	const adminCountResult = db
		.select({ count: count() })
		.from(schema.users)
		.where(eq(schema.users.role, 'admin'))
		.get();

	const adminCount = adminCountResult?.count ?? 0;

	if (adminCount === 0) {
		const bootstrapPassword = env.BOOTSTRAP_ADMIN_PASSWORD || 'admin123';
		const bootstrapUsername = env.BOOTSTRAP_ADMIN_USERNAME || 'admin';
		const bootstrapName = env.BOOTSTRAP_ADMIN_NAME || 'Administrator';

		// Hash password using argon2
		const argon2 = await import('argon2');
		const hashedPassword = await argon2.hash(bootstrapPassword, { type: argon2.argon2id });

		db.insert(schema.users).values({
			name: bootstrapName,
			username: bootstrapUsername,
			password: hashedPassword,
			role: 'admin',
			verified: 1,
			mustChangePassword: 1
		}).run();

		console.log('Default admin user created:', bootstrapUsername);
	}
}

/**
 * Hash password using argon2id
 */
export async function hashPassword(password: string): Promise<string> {
	const argon2 = await import('argon2');
	return await argon2.hash(password, { type: argon2.argon2id });
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	const argon2 = await import('argon2');
	return await argon2.verify(hash, password);
}

initDB();
void bootstrapAdmin().catch((error) => {
	console.error('Failed to bootstrap admin user:', error);
});
