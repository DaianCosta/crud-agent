import { Router } from 'express';
import { TodoController } from '../controllers/todo.controller';
import { TodoService } from '../services/todo.service';
import { TodoRepository } from '../repositories/todo.repository';

const repository = new TodoRepository();
const service = new TodoService(repository);
const controller = new TodoController(service);

const router = Router();

router.post('/', controller.create);
router.get('/', controller.listAll);
router.get('/:id', controller.findById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export { router as todoRouter };
