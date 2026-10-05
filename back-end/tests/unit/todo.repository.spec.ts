import { TodoRepository } from '../../src/repositories/todo.repository';
import { Todo } from '../../src/models/todo.model';

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'uuid-1',
  title: 'Test todo',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('TodoRepository', () => {
  let repo: TodoRepository;

  beforeEach(() => {
    repo = new TodoRepository();
  });

  it('saves and retrieves a todo by id', () => {
    const todo = makeTodo();
    repo.save(todo);
    expect(repo.findById('uuid-1')).toEqual(todo);
  });

  it('findAll returns empty array when empty', () => {
    expect(repo.findAll()).toEqual([]);
  });

  it('findAll returns all saved todos', () => {
    const t1 = makeTodo({ id: 'uuid-1' });
    const t2 = makeTodo({ id: 'uuid-2', title: 'Another' });
    repo.save(t1);
    repo.save(t2);
    expect(repo.findAll()).toHaveLength(2);
  });

  it('findById returns undefined for unknown id', () => {
    expect(repo.findById('nonexistent')).toBeUndefined();
  });

  it('update replaces the todo', () => {
    const todo = makeTodo();
    repo.save(todo);
    const updated = { ...todo, title: 'Updated', completed: true };
    repo.update(updated);
    expect(repo.findById('uuid-1')).toEqual(updated);
  });

  it('delete removes a todo and returns true', () => {
    repo.save(makeTodo());
    expect(repo.delete('uuid-1')).toBe(true);
    expect(repo.findById('uuid-1')).toBeUndefined();
  });

  it('delete returns false when todo does not exist', () => {
    expect(repo.delete('nonexistent')).toBe(false);
  });
});
