import { Request, Response } from 'express';
import pkg from '../../package.json';

export function getVersion(req: Request, res: Response): void {
  const version: string = pkg.version;
  const buildDate: string =
    process.env.BUILD_DATE ?? new Date().toISOString().split('T')[0];

  if (req.query['format'] === 'short') {
    res.type('text/plain').send(version);
  } else {
    res.json({ version, buildDate });
  }
}
