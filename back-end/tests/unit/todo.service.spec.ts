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
