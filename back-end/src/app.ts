import express from 'express';
import { todoRouter } from './routes/todo.routes';
import { versionRouter } from './routes/version.routes';

const app = express();

app.use(express.json());

app.use('/todos', todoRouter);
app.use(versionRouter);

export { app };
