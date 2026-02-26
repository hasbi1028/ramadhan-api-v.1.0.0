import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/admin/users/pending - Get pending wali kelas users
 */
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'admin') {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}

		const usersList = await db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				kelas: users.kelas,
				verified: users.verified
			})
			.from(users)
			.where(and(eq(users.role, 'wali_kelas'), eq(users.verified, 0)))
			.all();

		return json({ users: usersList });
	} catch (error) {
		console.error('[Admin][Users Pending] Error:', error);
		return json({ error: 'Gagal mengambil data user pending' }, { status: 500 });
	}
};
