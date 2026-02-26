import { integer, sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';

/**
 * Users table - stores all user accounts (admin, wali_kelas, siswa)
 */
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	username: text('username').notNull().unique(),
	password: text('password').notNull(),
	role: text('role', { enum: ['admin', 'wali_kelas', 'siswa'] }).notNull(),
	kelas: text('kelas'),
	verified: integer('verified').notNull().default(0), // 0: pending, 1: approved, 2: rejected
	rejectedReason: text('rejected_reason'),
	mustChangePassword: integer('must_change_password').notNull().default(0)
});

/**
 * Amaliah table - daily activity records for students
 */
export const amaliah = sqliteTable('amaliah', {
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	day: integer('day').notNull(),
	checks: text('checks').notNull().default('{}'), // JSON string
	pages: integer('pages').notNull().default(0),
	catatan: text('catatan').notNull().default(''),
	temaTarawih: text('tema_tarawih'),
	temaKultumSubuh: text('tema_kultum_subuh'),
	parentVerified: integer('parent_verified').notNull().default(0), // 0: belum, 1: sudah
	parentName: text('parent_name'),
	parentSignature: text('parent_signature'),
	parentVerifiedAt: text('parent_verified_at')
}, (table) => [
	primaryKey({ columns: [table.userId, table.day], name: 'amaliah_pk' })
]);

/**
 * Classes table - class/study group management
 */
export const classes = sqliteTable('classes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	isActive: integer('is_active').notNull().default(1),
	createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
	updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP')
});
