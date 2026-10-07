import { Router } from 'express';
import { getVersion } from '../controllers/version.controller';

const versionRouter = Router();

versionRouter.get('/version', getVersion);

export { versionRouter };
