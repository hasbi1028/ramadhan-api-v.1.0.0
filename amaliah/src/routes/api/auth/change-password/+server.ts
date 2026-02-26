import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { db, hashPassword, verifyPassword } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const changePasswordSchema = z.object({
	old_password: z.string().min(1, 'Password lama wajib diisi'),
	new_password: z.string().min(6, 'Password baru minimal 6 karakter')
});

export const PUT: RequestHandler = async ({ request, locals }) => {
	try {
		const user = locals.user;
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const validation = changePasswordSchema.safeParse(body);
		if (!validation.success) {
			return json(
				{ error: validation.error.errors[0]?.message || 'Validasi gagal' },
				{ status: 400 }
			);
		}

		const { old_password, new_password } = validation.data;
		if (old_password === new_password) {
			return json({ error: 'Password baru harus berbeda dari password lama' }, { status: 400 });
		}

		const dbUser = await db
			.select({ id: users.id, password: users.password })
			.from(users)
			.where(eq(users.id, user.id))
			.get();

		if (!dbUser) {
			return json({ error: 'User tidak ditemukan' }, { status: 404 });
		}

		const validOldPassword = await verifyPassword(old_password, dbUser.password);
		if (!validOldPassword) {
			return json({ error: 'Password lama tidak sesuai' }, { status: 400 });
		}

		const hashedPassword = await hashPassword(new_password);

		await db
			.update(users)
			.set({ password: hashedPassword, mustChangePassword: 0 })
			.where(eq(users.id, user.id))
			.run();

		return json({ message: 'Password berhasil diubah' });
	} catch (error) {
		console.error('[Auth][Change Password] Error:', error);
		return json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
	}
};
