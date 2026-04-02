import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src';

describe('mail worker', () => {
	it('returns frontend HTML for the root path (unit style)', async () => {
		const request = new Request('http://example.com');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('text/html');
		expect(await response.text()).toContain('<title>Cloud Mail</title>');
	});

	it('returns frontend HTML for the root path (integration style)', async () => {
		const response = await SELF.fetch('http://example.com');
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('text/html');
		expect(await response.text()).toContain('<title>Cloud Mail</title>');
	});
});
