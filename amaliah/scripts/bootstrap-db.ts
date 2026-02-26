#!/usr/bin/env bun
/**
 * ═══════════════════════════════════════════════════════
 * Bootstrap Database Script
 * ═══════════════════════════════════════════════════════
 * Initialize database and create default admin user
 */

import { db, initDB, bootstrapAdmin } from '../src/lib/server/db/index.ts';
import { classes } from '../src/lib/server/db/schema.ts';

console.log('🚀 Starting database bootstrap...\n');

// Initialize database
initDB();
console.log('✅ Database initialized\n');

// Bootstrap admin user
try {
	await bootstrapAdmin();
	console.log('✅ Admin user bootstrap complete\n');
} catch (error) {
	console.error('❌ Admin bootstrap failed:', error);
}

// Seed default classes if empty
const existingClasses = await db.select().from(classes).all();

if (existingClasses.length === 0) {
	const defaultClasses = ['7A', '7B', '8A', '8B', '9A', '9B'];

	for (const className of defaultClasses) {
		await db.insert(classes).values({
			name: className,
			isActive: 1
		});
	}

	console.log('✅ Default classes created:', defaultClasses.join(', '), '\n');
} else {
	console.log('ℹ️  Classes already exist, skipping seed\n');
}

console.log('✨ Bootstrap complete!');
console.log('\n📝 Default admin credentials:');
console.log('   Username: admin');
console.log('   Password: admin123 (or from BOOTSTRAP_ADMIN_PASSWORD env)\n');
