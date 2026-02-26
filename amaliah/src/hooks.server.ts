import { json, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { JWT_SECRET } from '$lib/utils/env';
import jwt from 'jsonwebtoken';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { securityHandle } from '$lib/server/security';

interface JwtPayload {
	id: number;
	username: string;
	role: string;
}

const authHandle: Handle = async ({ event, resolve }) => {
	// Skip auth for non-API routes
	if (!event.url.pathname.startsWith('/api/')) {
		return resolve(event);
	}

	// Skip auth for public endpoints
	const publicEndpoints = ['/api/auth/login', '/api/auth/register', '/api/auth/classes', '/api/health'];
	if (publicEndpoints.some(endpoint => event.url.pathname.startsWith(endpoint))) {
		return resolve(event);
	}

	// Get authorization header
	const authHeader = event.request.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const token = authHeader.substring(7);

	try {
		// Verify token
		const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

		// Get user from database
		const user = await db
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
			.where(eq(users.id, payload.id))
			.get();

		if (!user) {
			return json({ error: 'User not found' }, { status: 401 });
		}

		// Set user in locals
		event.locals.user = user;

		return resolve(event);
	} catch (error) {
		console.error('[Auth] Token verification failed:', error);
		return json({ error: 'Invalid token' }, { status: 401 });
	}
};

// Chain security middleware with auth middleware
export const handle = sequence(securityHandle, authHandle);
