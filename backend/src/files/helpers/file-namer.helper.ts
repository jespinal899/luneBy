import { randomUUID } from 'crypto';

import { Request } from 'express';

/** Renombra el archivo a un UUID conservando la extensión. */
export const fileNamer = (
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  const ext = file.mimetype.split('/')[1];
  callback(null, `${randomUUID()}.${ext}`);
};
