import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users, amaliah } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/wali/siswa/:id/verification - Get student verification status per day
 */
export const GET: RequestHandler = async ({ params, url, locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'wali_kelas') {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}
		if (!user.kelas) {
			return json({ error: 'Kelas wali belum ditetapkan' }, { status: 400 });
		}

		const siswaId = parseInt(params.id);
		const day = url.searchParams.get('day');
		const dayNumber = day ? parseInt(day, 10) : null;
		if (day && Number.isNaN(dayNumber)) {
			return json({ error: 'Parameter day tidak valid' }, { status: 400 });
		}

		// Verify that the siswa belongs to this wali's class
		const siswa = await db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				kelas: users.kelas
			})
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

		// Get amaliah records
		const conditions = [eq(amaliah.userId, siswaId)];
		if (dayNumber !== null) {
			conditions.push(eq(amaliah.day, dayNumber));
		}
		const records = await db.select().from(amaliah).where(and(...conditions)).all();

		const verificationData = records.map((r) => ({
			day: r.day,
			checks: JSON.parse(r.checks || '{}'),
			pages: r.pages,
			catatan: r.catatan,
			parent_verified: r.parentVerified,
			parent_name: r.parentName,
			parent_verified_at: r.parentVerifiedAt,
			verification_status: r.parentVerified === 1 ? 'verified' : 'pending'
		}));

		return json({
			siswa: {
				id: siswa.id,
				name: siswa.name,
				username: siswa.username,
				kelas: siswa.kelas
			},
			verification: verificationData
		});
	} catch (error) {
		console.error('[Wali][Verification] Error:', error);
		return json({ error: 'Gagal mengambil data verifikasi' }, { status: 500 });
	}
};
