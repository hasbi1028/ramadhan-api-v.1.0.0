import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users, amaliah, classes } from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * GET /api/admin/stats - Get dashboard statistics
 */
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'admin') {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}

		// Get counts
		const totalWaliKelas = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(users)
			.where(eq(users.role, 'wali_kelas'))
			.get();

		const totalSiswa = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(users)
			.where(eq(users.role, 'siswa'))
			.get();

		const pendingWaliKelas = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(users)
			.where(and(eq(users.role, 'wali_kelas'), eq(users.verified, 0)))
			.get();

		const totalQuranPages = await db
			.select({ count: sql<number>`COALESCE(SUM(pages), 0)` })
			.from(amaliah)
			.get();

		return json({
			stats: {
				total_wali_kelas: totalWaliKelas?.count || 0,
				total_siswa: totalSiswa?.count || 0,
				pending_wali_kelas: pendingWaliKelas?.count || 0,
				total_quran_pages: totalQuranPages?.count || 0
			}
		});
	} catch (error) {
		console.error('[Admin][Stats] Error:', error);
		return json({ error: 'Gagal mengambil statistik' }, { status: 500 });
	}
};
