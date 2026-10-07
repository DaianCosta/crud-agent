import request from 'supertest';
import { app } from '../../src/app';
import pkg from '../../package.json';

describe('GET /version', () => {
  // AC-1: returns 200 with Content-Type application/json
  it('AC-1: returns 200 with Content-Type application/json', async () => {
    const res = await request(app).get('/version');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  // AC-2: JSON body contains version and buildDate as non-empty strings
  it('AC-2: body contains non-empty version and buildDate fields', async () => {
    const res = await request(app).get('/version');
    expect(typeof res.body.version).toBe('string');
    expect(res.body.version.length).toBeGreaterThan(0);
    expect(typeof res.body.buildDate).toBe('string');
    expect(res.body.buildDate.length).toBeGreaterThan(0);
  });

  // AC-3: version field matches package.json version
  it('AC-3: version field matches package.json version', async () => {
    const res = await request(app).get('/version');
    expect(res.body.version).toBe(pkg.version);
  });

  // AC-4: format=short returns 200 with Content-Type text/plain
  it('AC-4: format=short returns 200 with Content-Type text/plain', async () => {
    const res = await request(app).get('/version?format=short');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
  });

  // AC-5: format=short body is only the version number without extra whitespace
  it('AC-5: format=short body is the version number only, no JSON, no extra newlines', async () => {
    const res = await request(app).get('/version?format=short');
    expect(res.text).toBe(pkg.version);
  });

  // AC-6: format=unknown behaves like GET /version (returns full JSON)
  it('AC-6: format=unknown returns JSON like GET /version without format', async () => {
    const res = await request(app).get('/version?format=unknown');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.version).toBe(pkg.version);
    expect(typeof res.body.buildDate).toBe('string');
    expect(res.body.buildDate.length).toBeGreaterThan(0);
  });
});
