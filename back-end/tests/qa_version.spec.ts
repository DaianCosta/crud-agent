/**
 * QA edge-case tests — qa-engineer review, task-008
 * Covers edge cases not exercised by the implementer's integration tests.
 * Each case is linked to the acceptance criterion it extends.
 */

import request from 'supertest';
import pkg from '../package.json';

// We need a fresh app instance to inject BUILD_DATE env
function buildApp() {
  // Reset module cache so the controller re-reads process.env.BUILD_DATE
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { app } = require('../src/app');
  return app;
}

describe('AC-6 edge cases — non-"short" format values return full JSON', () => {
  it('AC-6: format= (empty string) returns JSON', async () => {
    const app = buildApp();
    const res = await request(app).get('/version?format=');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(typeof res.body.version).toBe('string');
    expect(typeof res.body.buildDate).toBe('string');
  });

  it('AC-6: format=SHORT (uppercase) returns JSON', async () => {
    const app = buildApp();
    const res = await request(app).get('/version?format=SHORT');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(typeof res.body.version).toBe('string');
  });

  it('AC-6: format=short,other (extra chars) returns JSON', async () => {
    const app = buildApp();
    const res = await request(app).get('/version?format=short2');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('AC-2 — buildDate format is YYYY-MM-DD (ISO 8601 date)', () => {
  it('AC-2: buildDate matches YYYY-MM-DD format when BUILD_DATE is not set', async () => {
    const savedBuildDate = process.env.BUILD_DATE;
    delete process.env.BUILD_DATE;
    const app = buildApp();
    const res = await request(app).get('/version');
    expect(res.status).toBe(200);
    expect(res.body.buildDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    if (savedBuildDate !== undefined) process.env.BUILD_DATE = savedBuildDate;
  });

  it('AC-2: buildDate equals BUILD_DATE env variable when set', async () => {
    process.env.BUILD_DATE = '2026-01-15';
    const app = buildApp();
    const res = await request(app).get('/version');
    expect(res.status).toBe(200);
    expect(res.body.buildDate).toBe('2026-01-15');
    delete process.env.BUILD_DATE;
  });
});

describe('AC-3 — version matches package.json', () => {
  it('AC-3: format=short returns exactly the package.json version, no extra whitespace', async () => {
    const app = buildApp();
    const res = await request(app).get('/version?format=short');
    expect(res.text).toBe(pkg.version);
    expect(res.text).not.toMatch(/\s/);
  });
});

describe('AC-4 / AC-5 — text/plain response has no JSON markers', () => {
  it('AC-4: Content-Type for format=short is text/plain (includes charset)', async () => {
    const app = buildApp();
    const res = await request(app).get('/version?format=short');
    expect(res.headers['content-type']).toMatch(/^text\/plain/);
    expect(res.headers['content-type']).not.toMatch(/application\/json/);
  });

  it('AC-5: format=short body does not contain JSON braces or quotes', async () => {
    const app = buildApp();
    const res = await request(app).get('/version?format=short');
    expect(res.text).not.toContain('{');
    expect(res.text).not.toContain('"');
    expect(res.text.trim()).toBe(pkg.version);
  });
});
