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
 * PUT /api/wali/siswa/:id/verify - Approve or reject student registration
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'wali_kelas') {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}

		const siswaId = parseInt(params.id);
		const body = await request.json();
		const validation = verifySchema.safeParse(body);

		if (!validation.success) {
			return json(
				{ error: validation.error.errors[0]?.message || 'Validasi gagal' },
				{ status: 400 }
			);
		}

		const { action, reason } = validation.data;

		// Verify that the siswa belongs to this wali's class
		const target = await db
			.select({ id: users.id, kelas: users.kelas })
			.from(users)
			.where(and(eq(users.id, siswaId), eq(users.role, 'siswa')))
			.get();

		if (!target || target.kelas !== user.kelas) {
			return json(
				{ error: 'Siswa tidak ditemukan atau bukan dari kelas Anda' },
				{ status: 404 }
			);
		}

		const newStatus = action === 'approve' ? 1 : 2;

		await db
			.update(users)
			.set({
				verified: newStatus,
				rejectedReason: action === 'reject' ? (reason || null) : null
			})
			.where(eq(users.id, siswaId));

		return json({
			message: action === 'approve' ? 'Verifikasi sukses' : 'Siswa ditolak'
		});
	} catch (error) {
		console.error('[Wali][Verify] Error:', error);
		return json({ error: 'Gagal memverifikasi siswa' }, { status: 500 });
	}
};
