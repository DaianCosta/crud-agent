export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  reminder: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  reminder?: string | null;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
  reminder?: string | null;
}
