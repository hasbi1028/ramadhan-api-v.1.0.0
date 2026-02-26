import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { amaliah } from '$lib/server/db/schema';

const amaliahSchema = z.object({
	checks: z.record(z.boolean()).optional().default({}),
	pages: z.number().int().min(0).optional().default(0),
	catatan: z.string().optional().default(''),
	tema_tarawih: z.string().optional().default(''),
	tema_kultum_subuh: z.string().optional().default(''),
	parent_verified: z.number().optional().default(0),
	parent_name: z.string().optional(),
	parent_signature: z.any().optional()
});

/**
 * PUT /api/amaliah/:day - Save or update amaliah for a specific day
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'siswa') {
			return json({ error: 'Hanya akses siswa' }, { status: 403 });
		}

		const day = parseInt(params.day, 10);
		if (Number.isNaN(day) || day < 1 || day > 30) {
			return json({ error: 'Hari tidak valid (1-30)' }, { status: 400 });
		}

		const body = await request.json();
		const validation = amaliahSchema.safeParse(body);
		if (!validation.success) {
			return json(
				{ error: validation.error.errors[0]?.message || 'Validasi gagal' },
				{ status: 400 }
			);
		}

		const {
			checks,
			pages,
			catatan,
			tema_tarawih,
			tema_kultum_subuh,
			parent_verified,
			parent_name,
			parent_signature
		} = validation.data;

		const parentVerifiedAt = parent_verified === 1 ? new Date().toISOString() : null;

		await db
			.insert(amaliah)
			.values({
				userId: user.id,
				day,
				checks: JSON.stringify(checks),
				pages,
				catatan,
				temaTarawih: tema_tarawih || '',
				temaKultumSubuh: tema_kultum_subuh || '',
				parentVerified: parent_verified || 0,
				parentName: parent_name || null,
				parentSignature: parent_signature || null,
				parentVerifiedAt
			})
			.onConflictDoUpdate({
				target: [amaliah.userId, amaliah.day],
				set: {
					checks: JSON.stringify(checks),
					pages,
					catatan,
					temaTarawih: tema_tarawih || '',
					temaKultumSubuh: tema_kultum_subuh || '',
					parentVerified: parent_verified || 0,
					parentName: parent_name || null,
					parentSignature: parent_signature || null,
					parentVerifiedAt
				}
			});

		return json({ message: `Hari ${day} tersimpan` });
	} catch (error) {
		console.error('[Amaliah][PUT] Error:', error);
		return json({ error: 'Gagal menyimpan data' }, { status: 500 });
	}
};
