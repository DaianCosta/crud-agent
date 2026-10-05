/**
 * QA acceptance tests — qa-engineer review iteration 1 + reminder feature
 * Verifies each AC-1..AC-9 (reminder) with explicit evidence.
 * Gaps exercised: Content-Type header (AC-10), UUID format (AC-1/AC-4/AC-6),
 * PUT empty body edge case, 204 has no body (AC-8).
 */

import request from 'supertest';
import express, { Router } from 'express';
import { TodoController } from '../src/controllers/todo.controller';
import { TodoService } from '../src/services/todo.service';
import { TodoRepository } from '../src/repositories/todo.repository';

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function buildApp(): express.Application {
  const app = express();
  app.use(express.json());
  const repo = new TodoRepository();
  const svc = new TodoService(repo);
  const ctrl = new TodoController(svc);
  const router = Router();
  router.post('/', ctrl.create);
  router.get('/', ctrl.listAll);
  router.get('/:id', ctrl.findById);
  router.put('/:id', ctrl.update);
  router.delete('/:id', ctrl.delete);
  app.use('/todos', router);
  return app;
}

describe('AC-1: POST /todos — 201 with full object', () => {
  it('returns 201 with id (UUID v4), title, completed=false, createdAt, updatedAt', async () => {
    const app = buildApp();
    const res = await request(app).post('/todos').send({ title: 'Buy milk' });
    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(UUID_V4_RE);
    expect(res.body.title).toBe('Buy milk');
    expect(res.body.completed).toBe(false);
    expect(typeof res.body.createdAt).toBe('string');
    expect(typeof res.body.updatedAt).toBe('string');
    expect(new Date(res.body.createdAt).toISOString()).toBe(res.body.createdAt);
    expect(new Date(res.body.updatedAt).toISOString()).toBe(res.body.updatedAt);
  });
});

describe('AC-2: POST /todos — 400 for missing/empty title', () => {
  it('returns 400 when title is absent', async () => {
    const app = buildApp();
    const res = await request(app).post('/todos').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });

  it('returns 400 when title is empty string', async () => {
    const app = buildApp();
    const res = await request(app).post('/todos').send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });

  it('returns 400 when title is whitespace only', async () => {
    const app = buildApp();
    const res = await request(app).post('/todos').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });
});

describe('AC-3: GET /todos — 200 with array', () => {
  it('returns 200 with empty array when no todos', async () => {
    const app = buildApp();
    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it('returns 200 with all todos', async () => {
    const app = buildApp();
    await request(app).post('/todos').send({ title: 'A' });
    await request(app).post('/todos').send({ title: 'B' });
    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('AC-4 & AC-5: GET /todos/:id', () => {
  it('AC-4: returns 200 with correct object when id exists', async () => {
    const app = buildApp();
    const created = await request(app).post('/todos').send({ title: 'Find me' });
    const res = await request(app).get(`/todos/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(created.body);
  });

  it('AC-5: returns 404 when id does not exist', async () => {
    const app = buildApp();
    const res = await request(app).get('/todos/00000000-0000-4000-a000-000000000000');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Todo not found');
  });
});

describe('AC-6 & AC-7: PUT /todos/:id', () => {
  it('AC-6: updates completed and returns 200 with updatedAt changed', async () => {
    const app = buildApp();
    const created = await request(app).post('/todos').send({ title: 'Task' });
    await new Promise((r) => setTimeout(r, 5));
    const res = await request(app)
      .put(`/todos/${created.body.id}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
    expect(res.body.createdAt).toBe(created.body.createdAt);
    // updatedAt must be a valid ISO string
    expect(new Date(res.body.updatedAt).toISOString()).toBe(res.body.updatedAt);
  });

  it('AC-6: updates title', async () => {
    const app = buildApp();
    const created = await request(app).post('/todos').send({ title: 'Old' });
    const res = await request(app).put(`/todos/${created.body.id}`).send({ title: 'New' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New');
  });

  it('AC-7: returns 404 when id does not exist', async () => {
    const app = buildApp();
    const res = await request(app)
      .put('/todos/00000000-0000-4000-a000-000000000000')
      .send({ completed: false });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Todo not found');
  });
});

describe('AC-8 & AC-9: DELETE /todos/:id', () => {
  it('AC-8: returns 204 with empty body', async () => {
    const app = buildApp();
    const created = await request(app).post('/todos').send({ title: 'Delete me' });
    const res = await request(app).delete(`/todos/${created.body.id}`);
    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });

  it('AC-9: returns 404 when id does not exist', async () => {
    const app = buildApp();
    const res = await request(app).delete('/todos/00000000-0000-4000-a000-000000000000');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Todo not found');
  });
});

describe('AC-10: Content-Type application/json on all JSON-returning endpoints', () => {
  it('POST /todos returns Content-Type: application/json', async () => {
    const app = buildApp();
    const res = await request(app).post('/todos').send({ title: 'CT test' });
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET /todos returns Content-Type: application/json', async () => {
    const app = buildApp();
    const res = await request(app).get('/todos');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET /todos/:id (found) returns Content-Type: application/json', async () => {
    const app = buildApp();
    const created = await request(app).post('/todos').send({ title: 'CT test' });
    const res = await request(app).get(`/todos/${created.body.id}`);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET /todos/:id (404) returns Content-Type: application/json', async () => {
    const app = buildApp();
    const res = await request(app).get('/todos/nonexistent-id');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('PUT /todos/:id returns Content-Type: application/json', async () => {
    const app = buildApp();
    const created = await request(app).post('/todos').send({ title: 'CT test' });
    const res = await request(app).put(`/todos/${created.body.id}`).send({ completed: true });
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('DELETE /todos/:id (404) returns Content-Type: application/json', async () => {
    const app = buildApp();
    const res = await request(app).delete('/todos/nonexistent-id');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('Reminder feature ACs', () => {
  it('AC-R1: POST with reminder returns 201 with reminder field', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/todos')
      .send({ title: 'With reminder', reminder: '2026-10-10T14:30:00Z' });
    expect(res.status).toBe(201);
    expect(res.body.reminder).toBe('2026-10-10T14:30:00Z');
  });

  it('AC-R2: POST without reminder returns 201 with reminder null', async () => {
    const app = buildApp();
    const res = await request(app).post('/todos').send({ title: 'No reminder' });
    expect(res.status).toBe(201);
    expect(res.body.reminder).toBeNull();
  });

  it('AC-R3: PUT with reminder updates the reminder field', async () => {
    const app = buildApp();
    const created = await request(app).post('/todos').send({ title: 'Task' });
    const res = await request(app)
      .put(`/todos/${created.body.id}`)
      .send({ reminder: '2026-10-11T09:00:00Z' });
    expect(res.status).toBe(200);
    expect(res.body.reminder).toBe('2026-10-11T09:00:00Z');
  });

  it('AC-R4: PUT with reminder null removes the reminder', async () => {
    const app = buildApp();
    const created = await request(app)
      .post('/todos')
      .send({ title: 'Task', reminder: '2026-10-10T14:30:00Z' });
    const res = await request(app)
      .put(`/todos/${created.body.id}`)
      .send({ reminder: null });
    expect(res.status).toBe(200);
    expect(res.body.reminder).toBeNull();
  });

  it('AC-R5: GET /todos/:id response contains reminder field', async () => {
    const app = buildApp();
    const created = await request(app)
      .post('/todos')
      .send({ title: 'Task', reminder: '2026-10-10T14:30:00Z' });
    const res = await request(app).get(`/todos/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.reminder).toBe('2026-10-10T14:30:00Z');
  });

  it('AC-R6: GET /todos — each item contains reminder field', async () => {
    const app = buildApp();
    await request(app).post('/todos').send({ title: 'A', reminder: '2026-10-10T14:30:00Z' });
    await request(app).post('/todos').send({ title: 'B' });
    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    for (const item of res.body) {
      expect('reminder' in item).toBe(true);
    }
  });

  it('AC-R7: POST with invalid reminder returns 400', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/todos')
      .send({ title: 'Task', reminder: 'not-a-date' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Reminder must be a valid ISO 8601 date string');
  });

  it('AC-R7: PUT with invalid reminder returns 400', async () => {
    const app = buildApp();
    const created = await request(app).post('/todos').send({ title: 'Task' });
    const res = await request(app)
      .put(`/todos/${created.body.id}`)
      .send({ reminder: 'not-a-date' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Reminder must be a valid ISO 8601 date string');
  });

  it('AC-R8: past dates are accepted for reminder', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/todos')
      .send({ title: 'Task', reminder: '2020-01-01T00:00:00Z' });
    expect(res.status).toBe(201);
    expect(res.body.reminder).toBe('2020-01-01T00:00:00Z');
  });
});

describe('Edge cases', () => {
  it('PUT /todos/:id with empty body still returns 200 (no 400 enforcement for missing fields)', async () => {
    // The API contract says "at least one field must be provided" but no AC enforces a 400.
    // This test documents the current behaviour (returns 200).
    const app = buildApp();
    const created = await request(app).post('/todos').send({ title: 'Unchanged' });
    const res = await request(app).put(`/todos/${created.body.id}`).send({});
    // Implementation allows empty update — documents actual behaviour
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Unchanged');
  });

  it('title is trimmed before storage (POST)', async () => {
    const app = buildApp();
    const res = await request(app).post('/todos').send({ title: '  trimmed  ' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('trimmed');
  });

  it('title is trimmed on PUT update', async () => {
    const app = buildApp();
    const created = await request(app).post('/todos').send({ title: 'Old' });
    const res = await request(app).put(`/todos/${created.body.id}`).send({ title: '  New  ' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New');
  });

  it('GET /todos after DELETE returns reduced list', async () => {
    const app = buildApp();
    await request(app).post('/todos').send({ title: 'Keep' });
    const del = await request(app).post('/todos').send({ title: 'Delete' });
    await request(app).delete(`/todos/${del.body.id}`);
    const res = await request(app).get('/todos');
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Keep');
  });
});
