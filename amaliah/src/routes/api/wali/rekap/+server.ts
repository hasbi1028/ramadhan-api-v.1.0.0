import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users, amaliah } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/wali/rekap - Get recap of all students in wali's class
 */
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'wali_kelas') {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}
		if (!user.kelas) {
			return json({ error: 'Kelas wali belum ditetapkan' }, { status: 400 });
		}

		// Get all verified students in this class
		const siswaList = await db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				kelas: users.kelas
			})
			.from(users)
			.where(
				and(
					eq(users.role, 'siswa'),
					eq(users.kelas, user.kelas),
					eq(users.verified, 1)
				)
			)
			.all();

		// For each student, aggregate their amaliah
		const rekap = await Promise.all(
			siswaList.map(async (s) => {
				const records = await db
					.select()
					.from(amaliah)
					.where(eq(amaliah.userId, s.id))
					.all();

				let totalPages = 0;
				const hariTercatat = records.length;

				for (const r of records) {
					totalPages += r.pages || 0;
				}

				return {
					id: s.id,
					name: s.name,
					username: s.username,
					kelas: s.kelas,
					hari_tercatat: hariTercatat,
					total_pages: totalPages
				};
			})
		);

		return json({ rekap });
	} catch (error) {
		console.error('[Wali][Rekap] Error:', error);
		return json({ error: 'Gagal mengambil rekap' }, { status: 500 });
	}
};
