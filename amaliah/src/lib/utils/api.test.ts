/**
 * ═══════════════════════════════════════════════════════
 * API Client Tests
 * ═══════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiGet, apiPost, apiPut, apiDelete } from './api';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);
vi.stubGlobal('localStorage', {
	getItem: vi.fn(() => null),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
});

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('window', {});
  });

  describe('apiGet', () => {
    it('should make GET request successfully', async () => {
      const mockResponse = { data: { users: [] } };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiGet('/api/users');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users'),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const mockError = { error: 'Not found' };
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => mockError,
      });

      const result = await apiGet('/api/invalid');
      
      expect(result.error).toBeDefined();
      expect(result.error).toBe('Not found');
    });

    it('should handle network errors', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      const result = await apiGet('/api/users');
      
      expect(result.error).toBe('Gagal terhubung ke server');
    });
  });

  describe('apiPost', () => {
    it('should make POST request with body', async () => {
      const mockResponse = { data: { token: 'abc123' }, message: 'Login berhasil' };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiPost('/api/auth/login', {
        username: 'admin',
        password: 'admin123'
      });
      
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'admin', password: 'admin123' })
        })
      );
      expect(result.data).toEqual({ token: 'abc123' });
    });

    it('should handle validation errors', async () => {
      const mockError = { error: 'Username wajib diisi' };
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => mockError,
      });

      const result = await apiPost('/api/auth/login', {
        username: '',
        password: 'test'
      });
      
      expect(result.error).toBe('Username wajib diisi');
    });
  });

  describe('apiPut', () => {
    it('should make PUT request with body', async () => {
      const mockResponse = { data: { message: 'Data saved' } };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiPut('/api/amaliah/1', {
        checks: { sholat_subuh: true },
        pages: 5
      });
      
      expect(result.data).toEqual({ message: 'Data saved' });
    });
  });

  describe('apiDelete', () => {
    it('should make DELETE request', async () => {
      const mockResponse = { data: { message: 'Deleted successfully' } };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiDelete('/api/users/1');
      
      expect(result.data).toEqual({ message: 'Deleted successfully' });
    });
  });

  describe('Authentication', () => {
    it('should include auth token when logged in', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('test-token-123');
      
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} }),
      });

      await apiGet('/api/auth/me');
      
      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      const headers = options.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer test-token-123');
    });

    it('should not include token when not logged in', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} }),
      });

      await apiGet('/api/auth/me');

      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      const headers = options.headers as Headers;
      expect(headers.has('Authorization')).toBe(false);
    });
  });
});
