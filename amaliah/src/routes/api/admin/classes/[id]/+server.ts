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
 * PUT /api/admin/classes/:id - Update class
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'admin') {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}

		const classId = parseInt(params.id);

		if (isNaN(classId)) {
			return json({ error: 'ID kelas tidak valid' }, { status: 400 });
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

		// Get current class
		const currentClass = await db
			.select({ id: classes.id, name: classes.name })
			.from(classes)
			.where(eq(classes.id, classId))
			.get();

		if (!currentClass) {
			return json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
		}

		// Check for duplicate name
		const duplicate = await db
			.select({ id: classes.id })
			.from(classes)
			.where(
				and(
					eq(sql`LOWER(${classes.name})`, trimmedName.toLowerCase()),
					sql`${classes.id} != ${classId}`
				)
			)
			.get();

		if (duplicate) {
			return json({ error: 'Nama kelas sudah digunakan' }, { status: 400 });
		}

		const now = new Date().toISOString();

		// Update class
		await db
			.update(classes)
			.set({
				name: trimmedName,
				updatedAt: now
			})
			.where(eq(classes.id, classId));

		// Update users with old class name
		if (currentClass.name !== trimmedName) {
			await db
				.update(users)
				.set({ kelas: trimmedName })
				.where(eq(users.kelas, currentClass.name));
		}

		return json({ message: 'Kelas berhasil diperbarui' });
	} catch (error) {
		console.error('[Admin][Classes PUT] Error:', error);
		return json({ error: 'Gagal memperbarui kelas' }, { status: 500 });
	}
};

/**
 * DELETE /api/admin/classes/:id - Delete class
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'admin') {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}

		const classId = parseInt(params.id);

		if (isNaN(classId)) {
			return json({ error: 'ID kelas tidak valid' }, { status: 400 });
		}

		// Get class
		const classRow = await db
			.select({ id: classes.id, name: classes.name })
			.from(classes)
			.where(eq(classes.id, classId))
			.get();

		if (!classRow) {
			return json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
		}

		// Check if class is used by users
		const usedByUsers = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(users)
			.where(eq(users.kelas, classRow.name))
			.get();

		if (usedByUsers && usedByUsers.count > 0) {
			return json(
				{ error: 'Kelas masih digunakan oleh user. Pindahkan user terlebih dahulu.' },
				{ status: 400 }
			);
		}

		// Delete class
		await db.delete(classes).where(eq(classes.id, classId));

		return json({ message: 'Kelas berhasil dihapus' });
	} catch (error) {
		console.error('[Admin][Classes DELETE] Error:', error);
		return json({ error: 'Gagal menghapus kelas' }, { status: 500 });
	}
};
