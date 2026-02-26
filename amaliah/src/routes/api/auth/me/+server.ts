import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const user = locals.user;

		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		return json({ user });
	} catch (error) {
		console.error('[Auth][Me] Error:', error);
		return json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
	}
};
