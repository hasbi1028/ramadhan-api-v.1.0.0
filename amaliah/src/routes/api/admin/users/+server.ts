import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

const querySchema = z.object({
	role: z.enum(['wali_kelas', 'siswa'])
});

/**
 * GET /api/admin/users - Get users by role
 */
export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'admin') {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}

		const role = url.searchParams.get('role');

		if (!role || (role !== 'wali_kelas' && role !== 'siswa')) {
			return json({ error: 'Role tidak valid' }, { status: 400 });
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
			.where(eq(users.role, role))
			.all();

		return json({ users: usersList });
	} catch (error) {
		console.error('[Admin][Users] Error:', error);
		return json({ error: 'Gagal mengambil data user' }, { status: 500 });
	}
};
