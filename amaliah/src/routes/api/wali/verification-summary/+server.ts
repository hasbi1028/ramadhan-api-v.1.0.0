import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users, amaliah } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/wali/verification-summary - Get all students verification summary for a specific day
 */
export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'wali_kelas') {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}
		if (!user.kelas) {
			return json({ error: 'Kelas wali belum ditetapkan' }, { status: 400 });
		}

		const day = url.searchParams.get('day');
		const dayNumber = day ? parseInt(day, 10) : null;
		if (day && Number.isNaN(dayNumber)) {
			return json({ error: 'Parameter day tidak valid' }, { status: 400 });
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

		const summary = await Promise.all(
			siswaList.map(async (s) => {
				const conditions = [eq(amaliah.userId, s.id)];
				if (dayNumber !== null) {
					conditions.push(eq(amaliah.day, dayNumber));
				}

				const record = await db.select().from(amaliah).where(and(...conditions)).get();

				return {
					id: s.id,
					name: s.name,
					username: s.username,
					kelas: s.kelas,
					day: dayNumber ?? record?.day ?? null,
					has_data: !!record,
					parent_verified: record?.parentVerified || 0,
					parent_name: record?.parentName,
					parent_signature: record?.parentSignature,
					parent_verified_at: record?.parentVerifiedAt,
					pages: record?.pages || 0,
					verification_status:
						record?.parentVerified === 1
							? 'verified'
							: record
								? 'pending'
								: 'no_data'
				};
			})
		);

		// Sort by verification status (verified first, then pending, then no_data)
		const statusOrder: Record<string, number> = { verified: 0, pending: 1, no_data: 2 };
		summary.sort((a, b) => statusOrder[a.verification_status] - statusOrder[b.verification_status]);

		return json({ summary });
	} catch (error) {
		console.error('[Wali][Verification Summary] Error:', error);
		return json({ error: 'Gagal mengambil ringkasan verifikasi' }, { status: 500 });
	}
};
