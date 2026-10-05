import { v4 as uuidv4 } from 'uuid';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../models/todo.model';
import { TodoRepository } from '../repositories/todo.repository';
import { NotFoundError } from '../errors/not-found.error';

export class TodoService {
  constructor(private readonly repository: TodoRepository) {}

  create(input: CreateTodoInput): Todo {
    const now = new Date().toISOString();
    const todo: Todo = {
      id: uuidv4(),
      title: input.title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    return this.repository.save(todo);
  }

  listAll(): Todo[] {
    return this.repository.findAll();
  }

  findById(id: string): Todo {
    const todo = this.repository.findById(id);
    if (!todo) {
      throw new NotFoundError('Todo not found');
    }
    return todo;
  }

  update(id: string, input: UpdateTodoInput): Todo {
    const todo = this.repository.findById(id);
    if (!todo) {
      throw new NotFoundError('Todo not found');
    }
    const updated: Todo = {
      ...todo,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.completed !== undefined ? { completed: input.completed } : {}),
      updatedAt: new Date().toISOString(),
    };
    return this.repository.update(updated);
  }

  delete(id: string): void {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Todo not found');
    }
  }
}
