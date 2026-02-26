import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

const verifySchema = z.object({
	action: z.enum(['approve', 'reject']),
	reason: z.string().optional()
});

/**
 * PUT /api/admin/users/:id/verify - Approve or reject wali kelas registration
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'admin') {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}

		const userId = parseInt(params.id);
		const body = await request.json();
		const validation = verifySchema.safeParse(body);

		if (!validation.success) {
			return json(
				{ error: validation.error.errors[0]?.message || 'Validasi gagal' },
				{ status: 400 }
			);
		}

		const { action, reason } = validation.data;

		// Verify that target is a wali_kelas
		const target = await db
			.select({ id: users.id, role: users.role })
			.from(users)
			.where(and(eq(users.id, userId), eq(users.role, 'wali_kelas')))
			.get();

		if (!target) {
			return json({ error: 'Wali Kelas tidak ditemukan' }, { status: 404 });
		}

		const newStatus = action === 'approve' ? 1 : 2;

		await db
			.update(users)
			.set({
				verified: newStatus,
				rejectedReason: action === 'reject' ? (reason || null) : null
			})
			.where(eq(users.id, userId));

		return json({
			message: action === 'approve' ? 'Verifikasi sukses' : 'Wali Kelas ditolak'
		});
	} catch (error) {
		console.error('[Admin][Verify] Error:', error);
		return json({ error: 'Gagal memverifikasi wali kelas' }, { status: 500 });
	}
};

/**
 * DELETE /api/admin/users/:id - Delete user
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'admin') {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}

		const userId = parseInt(params.id);

		// Prevent deleting oneself
		if (user.id === userId) {
			return json({ error: 'Tidak dapat menghapus diri sendiri' }, { status: 400 });
		}

		// Check if user exists
		const target = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.id, userId))
			.get();

		if (!target) {
			return json({ error: 'User tidak ditemukan' }, { status: 404 });
		}

		// Delete user (related amaliah records will be cascade deleted)
		await db.delete(users).where(eq(users.id, userId));

		return json({ message: 'User berhasil dihapus' });
	} catch (error) {
		console.error('[Admin][Delete] Error:', error);
		return json({ error: 'Gagal menghapus user' }, { status: 500 });
	}
};
