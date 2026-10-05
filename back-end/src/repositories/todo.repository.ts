import { Todo } from '../models/todo.model';

export class TodoRepository {
  private todos: Map<string, Todo> = new Map();

  save(todo: Todo): Todo {
    this.todos.set(todo.id, todo);
    return todo;
  }

  findAll(): Todo[] {
    return Array.from(this.todos.values());
  }

  findById(id: string): Todo | undefined {
    return this.todos.get(id);
  }

  update(todo: Todo): Todo {
    this.todos.set(todo.id, todo);
    return todo;
  }

  delete(id: string): boolean {
    return this.todos.delete(id);
  }
}
