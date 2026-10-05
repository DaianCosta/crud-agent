import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import { TodoController } from '../../src/controllers/todo.controller';
import { TodoService } from '../../src/services/todo.service';
import { TodoRepository } from '../../src/repositories/todo.repository';

function buildApp(): express.Application {
  const app = express();
  app.use(express.json());

  const repository = new TodoRepository();
  const service = new TodoService(repository);
  const controller = new TodoController(service);

  const router = Router();
  router.post('/', controller.create);
  router.get('/', controller.listAll);
  router.get('/:id', controller.findById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  app.use('/todos', router);
  return app;
}

describe('Todo Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = buildApp();
  });

  describe('POST /todos', () => {
    it('creates a todo and returns 201', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'Buy milk' });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeTruthy();
      expect(res.body.title).toBe('Buy milk');
      expect(res.body.completed).toBe(false);
      expect(res.body.createdAt).toBeTruthy();
      expect(res.body.updatedAt).toBeTruthy();
    });

    it('returns 400 when title is missing', async () => {
      const res = await request(app).post('/todos').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });

    it('returns 400 when title is empty string', async () => {
      const res = await request(app).post('/todos').send({ title: '' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });

    it('returns 400 when title is whitespace only', async () => {
      const res = await request(app).post('/todos').send({ title: '   ' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });

    it('creates a todo with reminder and returns 201', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'Task', reminder: '2026-10-10T14:30:00Z' });
      expect(res.status).toBe(201);
      expect(res.body.reminder).toBe('2026-10-10T14:30:00Z');
    });

    it('creates a todo without reminder and reminder is null', async () => {
      const res = await request(app).post('/todos').send({ title: 'No reminder' });
      expect(res.status).toBe(201);
      expect(res.body.reminder).toBeNull();
    });

    it('returns 400 when reminder is an invalid date string', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'Task', reminder: 'not-a-date' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Reminder must be a valid ISO 8601 date string');
    });
  });

  describe('GET /todos', () => {
    it('returns empty array initially', async () => {
      const res = await request(app).get('/todos');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns all todos', async () => {
      await request(app).post('/todos').send({ title: 'Todo 1' });
      await request(app).post('/todos').send({ title: 'Todo 2' });
      const res = await request(app).get('/todos');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('each todo contains reminder field', async () => {
      await request(app).post('/todos').send({ title: 'A', reminder: '2026-10-10T14:30:00Z' });
      await request(app).post('/todos').send({ title: 'B' });
      const res = await request(app).get('/todos');
      expect(res.status).toBe(200);
      const withReminder = res.body.find((t: { title: string }) => t.title === 'A');
      const withoutReminder = res.body.find((t: { title: string }) => t.title === 'B');
      expect(withReminder.reminder).toBe('2026-10-10T14:30:00Z');
      expect(withoutReminder.reminder).toBeNull();
    });
  });

  describe('GET /todos/:id', () => {
    it('returns a todo by id', async () => {
      const created = await request(app).post('/todos').send({ title: 'Find me' });
      const res = await request(app).get(`/todos/${created.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(created.body);
    });

    it('returns a todo with reminder field', async () => {
      const created = await request(app)
        .post('/todos')
        .send({ title: 'With reminder', reminder: '2026-10-10T14:30:00Z' });
      const res = await request(app).get(`/todos/${created.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body.reminder).toBe('2026-10-10T14:30:00Z');
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).get('/todos/nonexistent-id');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Todo not found');
    });
  });

  describe('PUT /todos/:id', () => {
    it('updates completed status', async () => {
      const created = await request(app).post('/todos').send({ title: 'Task' });
      const res = await request(app)
        .put(`/todos/${created.body.id}`)
        .send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);
      expect(res.body.title).toBe('Task');
      expect(res.body.id).toBe(created.body.id);
      expect(res.body.createdAt).toBe(created.body.createdAt);
    });

    it('updates title', async () => {
      const created = await request(app).post('/todos').send({ title: 'Old' });
      const res = await request(app)
        .put(`/todos/${created.body.id}`)
        .send({ title: 'New' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('New');
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app)
        .put('/todos/nonexistent')
        .send({ completed: true });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Todo not found');
    });

    it('returns 400 for empty title', async () => {
      const created = await request(app).post('/todos').send({ title: 'Task' });
      const res = await request(app)
        .put(`/todos/${created.body.id}`)
        .send({ title: '' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when completed is not boolean', async () => {
      const created = await request(app).post('/todos').send({ title: 'Task' });
      const res = await request(app)
        .put(`/todos/${created.body.id}`)
        .send({ completed: 'yes' });
      expect(res.status).toBe(400);
    });

    it('updates reminder and returns 200', async () => {
      const created = await request(app).post('/todos').send({ title: 'Task' });
      const res = await request(app)
        .put(`/todos/${created.body.id}`)
        .send({ reminder: '2026-10-11T09:00:00Z' });
      expect(res.status).toBe(200);
      expect(res.body.reminder).toBe('2026-10-11T09:00:00Z');
    });

    it('removes reminder when set to null', async () => {
      const created = await request(app)
        .post('/todos')
        .send({ title: 'Task', reminder: '2026-10-11T09:00:00Z' });
      const res = await request(app)
        .put(`/todos/${created.body.id}`)
        .send({ reminder: null });
      expect(res.status).toBe(200);
      expect(res.body.reminder).toBeNull();
    });

    it('returns 400 when reminder is an invalid date string', async () => {
      const created = await request(app).post('/todos').send({ title: 'Task' });
      const res = await request(app)
        .put(`/todos/${created.body.id}`)
        .send({ reminder: 'bad-date' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Reminder must be a valid ISO 8601 date string');
    });
  });

  describe('DELETE /todos/:id', () => {
    it('deletes a todo and returns 204', async () => {
      const created = await request(app).post('/todos').send({ title: 'Delete me' });
      const res = await request(app).delete(`/todos/${created.body.id}`);
      expect(res.status).toBe(204);
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).delete('/todos/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Todo not found');
    });

    it('returns 404 when trying to get a deleted todo', async () => {
      const created = await request(app).post('/todos').send({ title: 'Gone' });
      await request(app).delete(`/todos/${created.body.id}`);
      const res = await request(app).get(`/todos/${created.body.id}`);
      expect(res.status).toBe(404);
    });
  });
});
