import express from 'express';
import { todoRouter } from './routes/todo.routes';

const app = express();

app.use(express.json());

app.use('/todos', todoRouter);

export { app };
