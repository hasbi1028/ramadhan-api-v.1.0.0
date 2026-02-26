import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const updateProfileSchema = z.object({
	name: z.string().min(1, 'Nama wajib diisi').max(100, 'Nama terlalu panjang')
});

export const PUT: RequestHandler = async ({ request, locals }) => {
	try {
		const user = locals.user;
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const validation = updateProfileSchema.safeParse(body);
		if (!validation.success) {
			return json(
				{ error: validation.error.errors[0]?.message || 'Validasi gagal' },
				{ status: 400 }
			);
		}

		const name = validation.data.name.trim();

		await db.update(users).set({ name }).where(eq(users.id, user.id)).run();

		const updatedUser = await db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				role: users.role,
				kelas: users.kelas,
				verified: users.verified,
				rejectedReason: users.rejectedReason,
				mustChangePassword: users.mustChangePassword
			})
			.from(users)
			.where(eq(users.id, user.id))
			.get();

		if (!updatedUser) {
			return json({ error: 'User tidak ditemukan' }, { status: 404 });
		}

		locals.user = updatedUser;

		return json({
			message: 'Profil berhasil diperbarui',
			data: { user: updatedUser }
		});
	} catch (error) {
		console.error('[Auth][Profile] Error:', error);
		return json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
	}
};
