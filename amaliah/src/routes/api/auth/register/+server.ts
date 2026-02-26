import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { users, classes } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword } from '$lib/server/db';

const registerSchema = z.object({
	name: z.string().min(1, 'Nama wajib diisi'),
	username: z.string().min(1, 'Username wajib diisi'),
	password: z.string().min(6, 'Password minimal 6 karakter'),
	role: z.enum(['admin', 'wali_kelas', 'siswa']),
	kelas: z.string().optional()
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const validation = registerSchema.safeParse(body);

		if (!validation.success) {
			return json(
				{ error: validation.error.errors[0]?.message || 'Validasi gagal' },
				{ status: 400 }
			);
		}

		const { name, username, password, role, kelas } = validation.data;

		// Check if username exists
		const existingUser = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.username, username))
			.get();

		if (existingUser) {
			return json({ error: 'Username sudah digunakan' }, { status: 400 });
		}

		// Validate class for siswa and wali_kelas
		const trimmedKelas = (kelas || '').trim();
		if ((role === 'siswa' || role === 'wali_kelas') && !trimmedKelas) {
			return json({ error: 'Kelas wajib dipilih' }, { status: 400 });
		}

		// Verify class exists if provided
		if (trimmedKelas) {
			const classExists = await db
				.select({ id: classes.id })
				.from(classes)
				.where(and(eq(classes.name, trimmedKelas), eq(classes.isActive, 1)))
				.get();

			if (!classExists) {
				return json({ error: 'Kelas tidak valid. Silakan pilih kelas dari daftar.' }, { status: 400 });
			}
		}

		// Prevent random users from registering as admin
		if (role === 'admin') {
			return json({ error: 'Tidak dapat mendaftar sebagai admin' }, { status: 403 });
		}

		// Hash password
		const hashedPassword = await hashPassword(password);

		// Create user
		const verifiedStatus = 0;

		await db.insert(users).values({
			name,
			username,
			password: hashedPassword,
			role,
			kelas: trimmedKelas || null,
			verified: verifiedStatus,
			mustChangePassword: 0
		});

		return json(
			{ message: 'Registrasi berhasil. Silakan tunggu verifikasi.' },
			{ status: 201 }
		);
	} catch (error) {
		console.error('[Auth][Register] Error:', error);
		return json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
	}
};
