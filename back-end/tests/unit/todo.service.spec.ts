import { TodoService } from '../../src/services/todo.service';
import { TodoRepository } from '../../src/repositories/todo.repository';
import { NotFoundError } from '../../src/errors/not-found.error';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    service = new TodoService(new TodoRepository());
  });

  describe('create', () => {
    it('creates a todo with the given title', () => {
      const todo = service.create({ title: 'Buy milk' });
      expect(todo.title).toBe('Buy milk');
      expect(todo.completed).toBe(false);
      expect(todo.id).toBeTruthy();
      expect(todo.createdAt).toBeTruthy();
      expect(todo.updatedAt).toBeTruthy();
    });

    it('createdAt and updatedAt are the same on creation', () => {
      const todo = service.create({ title: 'Test' });
      expect(todo.createdAt).toBe(todo.updatedAt);
    });

    it('creates a todo with reminder null when not provided', () => {
      const todo = service.create({ title: 'No reminder' });
      expect(todo.reminder).toBeNull();
    });

    it('creates a todo with reminder when provided', () => {
      const todo = service.create({ title: 'With reminder', reminder: '2026-10-10T14:30:00Z' });
      expect(todo.reminder).toBe('2026-10-10T14:30:00Z');
    });

    it('creates a todo with reminder null when explicitly null', () => {
      const todo = service.create({ title: 'Null reminder', reminder: null });
      expect(todo.reminder).toBeNull();
    });
  });

  describe('listAll', () => {
    it('returns empty array when no todos', () => {
      expect(service.listAll()).toEqual([]);
    });

    it('returns all created todos', () => {
      service.create({ title: 'Todo 1' });
      service.create({ title: 'Todo 2' });
      expect(service.listAll()).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('returns a todo by id', () => {
      const created = service.create({ title: 'Find me' });
      const found = service.findById(created.id);
      expect(found).toEqual(created);
    });

    it('throws NotFoundError for unknown id', () => {
      expect(() => service.findById('nonexistent')).toThrow(NotFoundError);
      expect(() => service.findById('nonexistent')).toThrow('Todo not found');
    });
  });

  describe('update', () => {
    it('updates the title of a todo', () => {
      const created = service.create({ title: 'Old title' });
      const updated = service.update(created.id, { title: 'New title' });
      expect(updated.title).toBe('New title');
      expect(updated.completed).toBe(false);
    });

    it('updates the completed status of a todo', () => {
      const created = service.create({ title: 'Task' });
      const updated = service.update(created.id, { completed: true });
      expect(updated.completed).toBe(true);
      expect(updated.title).toBe('Task');
    });

    it('updates updatedAt but not createdAt', () => {
      const created = service.create({ title: 'Task' });
      // Wait a tick to ensure timestamp differs
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);
      const updated = service.update(created.id, { completed: true });
      jest.useRealTimers();
      expect(updated.createdAt).toBe(created.createdAt);
      expect(updated.updatedAt).not.toBe(created.updatedAt);
    });

    it('throws NotFoundError for unknown id', () => {
      expect(() => service.update('nonexistent', { completed: true })).toThrow(NotFoundError);
    });

    it('updates reminder to a new value', () => {
      const created = service.create({ title: 'Task' });
      const updated = service.update(created.id, { reminder: '2026-10-10T14:30:00Z' });
      expect(updated.reminder).toBe('2026-10-10T14:30:00Z');
    });

    it('removes reminder when updated to null', () => {
      const created = service.create({ title: 'Task', reminder: '2026-10-10T14:30:00Z' });
      const updated = service.update(created.id, { reminder: null });
      expect(updated.reminder).toBeNull();
    });

    it('does not change reminder when not provided in update', () => {
      const created = service.create({ title: 'Task', reminder: '2026-10-10T14:30:00Z' });
      const updated = service.update(created.id, { completed: true });
      expect(updated.reminder).toBe('2026-10-10T14:30:00Z');
    });
  });

  describe('delete', () => {
    it('deletes an existing todo', () => {
      const created = service.create({ title: 'Delete me' });
      expect(() => service.delete(created.id)).not.toThrow();
      expect(() => service.findById(created.id)).toThrow(NotFoundError);
    });

    it('throws NotFoundError for unknown id', () => {
      expect(() => service.delete('nonexistent')).toThrow(NotFoundError);
    });
  });
});
