import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loginEmailForm, loginTokenForm } from '../src/login.js';

describe('Login Email Form', () => {
    let form;
    let mockFetch;
    let mockLocation;

    beforeEach(() => {
        form = loginEmailForm();
        mockFetch = vi.fn();
        global.fetch = mockFetch;
        mockLocation = { href: '' };
        delete window.location;
        window.location = mockLocation;
    });

    it('should initialize with empty email and error', () => {
        expect(form.email).toBe('');
        expect(form.error).toBe('');
    });

    it('should submit email successfully and redirect', async () => {
        form.email = 'test@example.com';
        mockFetch.mockResolvedValue({
            json: async () => ({ status: 'success' }),
        });

        await form.submitEmail();

        expect(mockFetch).toHaveBeenCalledWith('/.e/rest/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_key: 'test@example.com',
                cookie_ok: true
            }),
        });
        expect(window.location.href).toBe('/login-token.html');
        expect(form.error).toBe('');
    });

    it('should show error message from server', async () => {
        form.email = 'invalid@example.com';
        mockFetch.mockResolvedValue({
            json: async () => ({
                status: 'error',
                message: 'Invalid email address'
            }),
        });

        await form.submitEmail();

        expect(form.error).toBe('Invalid email address');
        expect(window.location.href).toBe('');
    });

    it('should show default error on network failure', async () => {
        form.email = 'test@example.com';
        mockFetch.mockRejectedValue(new Error('Network error'));

        await form.submitEmail();

        expect(form.error).toBe('An error occurred. Please try again.');
        expect(window.location.href).toBe('');
    });

    it('should show default error when no message provided', async () => {
        form.email = 'test@example.com';
        mockFetch.mockResolvedValue({
            json: async () => ({ status: 'error' }),
        });

        await form.submitEmail();

        expect(form.error).toBe('An error occurred. Please try again.');
    });

    it('should clear previous error on new submission', async () => {
        form.error = 'Previous error';
        form.email = 'test@example.com';
        mockFetch.mockResolvedValue({
            json: async () => ({ status: 'success' }),
        });

        await form.submitEmail();

        expect(form.error).toBe('');
    });
});

describe('Login Token Form', () => {
    let form;
    let mockFetch;
    let mockLocation;

    beforeEach(() => {
        form = loginTokenForm();
        mockFetch = vi.fn();
        global.fetch = mockFetch;
        mockLocation = { href: '' };
        delete window.location;
        window.location = mockLocation;
    });

    it('should initialize with empty token and error', () => {
        expect(form.token).toBe('');
        expect(form.error).toBe('');
    });

    it('should submit token successfully and redirect to home', async () => {
        form.token = '123456';
        mockFetch.mockResolvedValue({
            json: async () => ({ status: 'success' }),
        });

        await form.submitToken();

        expect(mockFetch).toHaveBeenCalledWith('/.e/rest/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_secret: '123456',
                cookie_ok: true
            }),
        });
        expect(window.location.href).toBe('/');
        expect(form.error).toBe('');
    });

    it('should show error message from server', async () => {
        form.token = '999999';
        mockFetch.mockResolvedValue({
            json: async () => ({
                status: 'error',
                message: 'Invalid token'
            }),
        });

        await form.submitToken();

        expect(form.error).toBe('Invalid token');
        expect(window.location.href).toBe('');
    });

    it('should show default error on network failure', async () => {
        form.token = '123456';
        mockFetch.mockRejectedValue(new Error('Network error'));

        await form.submitToken();

        expect(form.error).toBe('An error occurred. Please try again.');
        expect(window.location.href).toBe('');
    });

    it('should show default error when no message provided', async () => {
        form.token = '123456';
        mockFetch.mockResolvedValue({
            json: async () => ({ status: 'error' }),
        });

        await form.submitToken();

        expect(form.error).toBe('An error occurred. Please try again.');
    });

    it('should clear previous error on new submission', async () => {
        form.error = 'Previous error';
        form.token = '123456';
        mockFetch.mockResolvedValue({
            json: async () => ({ status: 'success' }),
        });

        await form.submitToken();

        expect(form.error).toBe('');
    });
});
