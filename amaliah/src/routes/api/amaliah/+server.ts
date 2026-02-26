import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { amaliah } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/amaliah - Get all amaliah records for current user (siswa only)
 */
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const user = locals.user;

		if (!user || user.role !== 'siswa') {
			return json({ error: 'Hanya akses siswa' }, { status: 403 });
		}

		const records = await db
			.select()
			.from(amaliah)
			.where(eq(amaliah.userId, user.id))
			.all();

		// Transform records into day-indexed object
		const data: Record<number, unknown> = {};
		for (const record of records) {
			data[record.day] = {
				checks: JSON.parse(record.checks || '{}'),
				pages: record.pages,
				catatan: record.catatan,
				tema_tarawih: record.temaTarawih,
				tema_kultum_subuh: record.temaKultumSubuh,
				parent_verified: record.parentVerified,
				parent_name: record.parentName,
				parent_signature: record.parentSignature,
				parent_verified_at: record.parentVerifiedAt
			};
		}

		return json({ data });
	} catch (error) {
		console.error('[Amaliah][GET] Error:', error);
		return json({ error: 'Gagal mengambil data amaliah' }, { status: 500 });
	}
};
