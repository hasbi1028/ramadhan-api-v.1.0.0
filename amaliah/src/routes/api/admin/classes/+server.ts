import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { users, classes } from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';

const classSchema = z.object({
	name: z.string().min(1, 'Nama kelas wajib diisi')
});

/**
 * GET /api/admin/classes - Get all active classes
 */
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'admin') {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}

		const activeClasses = await db
			.select({
				id: classes.id,
				name: classes.name,
				isActive: classes.isActive
			})
			.from(classes)
			.where(eq(classes.isActive, 1))
			.all();

		return json({ classes: activeClasses });
	} catch (error) {
		console.error('[Admin][Classes] Error:', error);
		return json({ error: 'Gagal mengambil data kelas' }, { status: 500 });
	}
};

/**
 * POST /api/admin/classes - Create new class
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'admin') {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}

		const body = await request.json();
		const validation = classSchema.safeParse(body);

		if (!validation.success) {
			return json(
				{ error: validation.error.errors[0]?.message || 'Validasi gagal' },
				{ status: 400 }
			);
		}

		const { name } = validation.data;
		const trimmedName = name.trim();

		if (!trimmedName) {
			return json({ error: 'Nama kelas wajib diisi' }, { status: 400 });
		}

		// Check if class already exists
		const exists = await db
			.select({ id: classes.id })
			.from(classes)
			.where(eq(sql`LOWER(${classes.name})`, trimmedName.toLowerCase()))
			.get();

		if (exists) {
			return json({ error: 'Kelas sudah ada' }, { status: 400 });
		}

		const now = new Date().toISOString();

		await db.insert(classes).values({
			name: trimmedName,
			isActive: 1,
			createdAt: now,
			updatedAt: now
		});

		return json({ message: 'Kelas berhasil ditambahkan' }, { status: 201 });
	} catch (error) {
		console.error('[Admin][Classes POST] Error:', error);
		return json({ error: 'Gagal menambahkan kelas' }, { status: 500 });
	}
};
