import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { classes } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	try {
		const activeClasses = await db
			.select({
				id: classes.id,
				name: classes.name
			})
			.from(classes)
			.where(eq(classes.isActive, 1))
			.orderBy(asc(classes.name));

		return json({ classes: activeClasses });
	} catch (error) {
		console.error('[Auth][Classes] Error:', error);
		return json({ error: 'Gagal mengambil data kelas' }, { status: 500 });
	}
};
