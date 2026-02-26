import { API_URL } from '$lib/utils/env.browser';

/**
 * API Error type
 */
export interface ApiError {
	error: string;
	message?: string;
}

/**
 * API Response type
 */
export interface ApiResponse<T = unknown> {
	data?: T;
	error?: string;
	message?: string;
}

/**
 * Get auth token from localStorage
 */
function getToken(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('rm_token');
}

/**
 * Generic API request handler
 */
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	const token = getToken();
	let url = endpoint;
	if (!endpoint.startsWith('http')) {
		const shouldTrimApiPrefix = API_URL.endsWith('/api') && endpoint.startsWith('/api/');
		const normalizedEndpoint = shouldTrimApiPrefix ? endpoint.slice(4) : endpoint;
		url = `${API_URL}${normalizedEndpoint}`;
	}

	const headers = new Headers(options.headers);
	headers.set('Content-Type', 'application/json');

	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	try {
		const response = await fetch(url, {
			...options,
			headers
		});

		const data = await response.json();

		if (!response.ok) {
			return { error: data.error || data.message || 'Terjadi kesalahan' };
		}

		return { data: data.data ?? data };
	} catch (error) {
		console.error('[API] Request failed:', error);
		return { error: 'Gagal terhubung ke server' };
	}
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
	return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost<T>(
	endpoint: string,
	body?: unknown,
	options?: RequestInit
): Promise<ApiResponse<T>> {
	return apiRequest<T>(endpoint, {
		...options,
		method: 'POST',
		body: body ? JSON.stringify(body) : undefined
	});
}

/**
 * PUT request
 */
export async function apiPut<T>(
	endpoint: string,
	body?: unknown,
	options?: RequestInit
): Promise<ApiResponse<T>> {
	return apiRequest<T>(endpoint, {
		...options,
		method: 'PUT',
		body: body ? JSON.stringify(body) : undefined
	});
}

/**
 * DELETE request
 */
export async function apiDelete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
	return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}
