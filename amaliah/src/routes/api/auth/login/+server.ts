import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '$lib/server/db';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRY } from '$lib/utils/env';

const loginSchema = z.object({
	username: z.string().min(1, 'Username wajib diisi'),
	password: z.string().min(1, 'Password wajib diisi')
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const validation = loginSchema.safeParse(body);

		if (!validation.success) {
			return json(
				{ error: validation.error.errors[0]?.message || 'Validasi gagal' },
				{ status: 400 }
			);
		}

		const { username, password } = validation.data;

		// Get user from database
		const user = await db
			.select()
			.from(users)
			.where(eq(users.username, username))
			.get();

		if (!user) {
			return json({ error: 'Username atau password salah' }, { status: 401 });
		}

		// Verify password
		const isMatch = await verifyPassword(password, user.password);

		if (!isMatch) {
			return json({ error: 'Username atau password salah' }, { status: 401 });
		}

		// Create JWT token
		const token = jwt.sign(
			{ id: user.id, username: user.username, role: user.role },
			JWT_SECRET,
			{ expiresIn: JWT_EXPIRY as SignOptions['expiresIn'] }
		);

		// Remove password from response
		const { password: _, ...userWithoutPassword } = user;

		return json({
			token,
			user: userWithoutPassword,
			message: 'Login berhasil'
		});
	} catch (error) {
		console.error('[Auth][Login] Error:', error);
		return json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
	}
};
