import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { amaliah } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

const parentVerifySchema = z.object({
	parent_name: z.string().min(1, 'Nama orang tua wajib diisi'),
	parent_signature: z.string().optional(),
	use_checkbox: z.boolean().optional().default(false)
});

/**
 * POST /api/amaliah/:day/verify-parent - Parent verification for a day
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'siswa') {
			return json({ error: 'Hanya akses siswa' }, { status: 403 });
		}

		const day = parseInt(params.day);

		if (isNaN(day) || day < 1 || day > 30) {
			return json({ error: 'Hari tidak valid (1-30)' }, { status: 400 });
		}

		const body = await request.json();
		const validation = parentVerifySchema.safeParse(body);

		if (!validation.success) {
			return json(
				{ error: validation.error.errors[0]?.message || 'Validasi gagal' },
				{ status: 400 }
			);
		}

		const { parent_name, parent_signature, use_checkbox } = validation.data;

		await db
			.update(amaliah)
			.set({
				parentVerified: 1,
				parentName: parent_name,
				parentSignature: use_checkbox ? 'checkbox_confirmed' : (parent_signature || null),
				parentVerifiedAt: new Date().toISOString()
			})
			.where(and(eq(amaliah.userId, user.id), eq(amaliah.day, day)));

		return json({ message: `Hari ${day} berhasil diverifikasi oleh orang tua` });
	} catch (error) {
		console.error('[Amaliah][Verify Parent] Error:', error);
		return json({ error: 'Gagal verifikasi' }, { status: 500 });
	}
};
