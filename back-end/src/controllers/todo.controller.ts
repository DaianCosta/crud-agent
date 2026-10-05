import { Request, Response } from 'express';
import { TodoService } from '../services/todo.service';
import { NotFoundError } from '../errors/not-found.error';

function isValidIsoDate(value: string): boolean {
  return !isNaN(new Date(value).getTime());
}

export class TodoController {
  constructor(private readonly service: TodoService) {}

  create = (req: Request, res: Response): void => {
    const body = req.body as { title?: unknown; reminder?: unknown };
    const { title } = body;
    if (typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const reminderRaw = body.reminder;
    let reminder: string | null | undefined;
    if (reminderRaw !== undefined) {
      if (reminderRaw === null) {
        reminder = null;
      } else if (typeof reminderRaw === 'string' && isValidIsoDate(reminderRaw)) {
        reminder = reminderRaw;
      } else {
        res.status(400).json({ error: 'Reminder must be a valid ISO 8601 date string' });
        return;
      }
    }

    const todo = this.service.create({ title: title.trim(), reminder });
    res.status(201).json(todo);
  };

  listAll = (_req: Request, res: Response): void => {
    const todos = this.service.listAll();
    res.status(200).json(todos);
  };

  findById = (req: Request, res: Response): void => {
    try {
      const todo = this.service.findById(req.params.id);
      res.status(200).json(todo);
    } catch (err) {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
        return;
      }
      throw err;
    }
  };

  update = (req: Request, res: Response): void => {
    const body = req.body as { title?: unknown; completed?: unknown; reminder?: unknown };
    const input: { title?: string; completed?: boolean; reminder?: string | null } = {};

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim() === '') {
        res.status(400).json({ error: 'Title must be a non-empty string' });
        return;
      }
      input.title = body.title.trim();
    }

    if (body.completed !== undefined) {
      if (typeof body.completed !== 'boolean') {
        res.status(400).json({ error: 'Completed must be a boolean' });
        return;
      }
      input.completed = body.completed;
    }

    if (body.reminder !== undefined) {
      if (body.reminder === null) {
        input.reminder = null;
      } else if (typeof body.reminder === 'string' && isValidIsoDate(body.reminder)) {
        input.reminder = body.reminder;
      } else {
        res.status(400).json({ error: 'Reminder must be a valid ISO 8601 date string' });
        return;
      }
    }

    try {
      const todo = this.service.update(req.params.id, input);
      res.status(200).json(todo);
    } catch (err) {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
        return;
      }
      throw err;
    }
  };

  delete = (req: Request, res: Response): void => {
    try {
      this.service.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
        return;
      }
      throw err;
    }
  };
}
