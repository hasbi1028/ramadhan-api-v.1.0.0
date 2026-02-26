import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { users, amaliah } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

const resetSchema = z.object({
	day: z.number().int().min(1).max(30)
});

/**
 * POST /api/wali/siswa/:id/reset-verification - Reset student verification for a specific day
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'wali_kelas') {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}
		if (!user.kelas) {
			return json({ error: 'Kelas wali belum ditetapkan' }, { status: 400 });
		}

		const siswaId = parseInt(params.id);
		const body = await request.json();
		const validation = resetSchema.safeParse(body);

		if (!validation.success) {
			return json(
				{ error: validation.error.errors[0]?.message || 'Validasi gagal' },
				{ status: 400 }
			);
		}

		const { day } = validation.data;

		// Verify that the siswa belongs to this wali's class
		const siswa = await db
			.select({ id: users.id, name: users.name, kelas: users.kelas })
			.from(users)
			.where(
				and(
					eq(users.id, siswaId),
					eq(users.role, 'siswa'),
					eq(users.kelas, user.kelas)
				)
			)
			.get();

		if (!siswa) {
			return json(
				{ error: 'Siswa tidak ditemukan atau bukan dari kelas Anda' },
				{ status: 404 }
			);
		}

		// Delete the amaliah record for this day
		await db
			.delete(amaliah)
			.where(and(eq(amaliah.userId, siswaId), eq(amaliah.day, day)));

		return json({
			message: `Verifikasi siswa ${siswa.name} untuk hari ke-${day} berhasil direset. Siswa dapat mengisi ulang.`,
			siswa: siswa.name,
			day: day
		});
	} catch (error) {
		console.error('[Wali][Reset Verification] Error:', error);
		return json({ error: 'Gagal mereset verifikasi' }, { status: 500 });
	}
};
