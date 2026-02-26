import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/wali/siswa - Get all students in wali's class
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

		const pending = url.searchParams.get('pending');
		const conditions = [eq(users.role, 'siswa'), eq(users.kelas, user.kelas)];
		if (pending === 'true') {
			conditions.push(eq(users.verified, 0));
		}

		const siswa = await db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				kelas: users.kelas,
				verified: users.verified
			})
			.from(users)
			.where(and(...conditions))
			.all();

		return json({ siswa });
	} catch (error) {
		console.error('[Wali][Siswa] Error:', error);
		return json({ error: 'Gagal mengambil data siswa' }, { status: 500 });
	}
};
