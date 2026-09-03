import { Request } from 'express';

const ALLOWED = ['jpg', 'jpeg', 'png', 'webp'];

/** Solo acepta imágenes por su extensión de MIME type. */
export const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const ext = file.mimetype.split('/')[1]?.toLowerCase();
  if (ext && ALLOWED.includes(ext)) return callback(null, true);
  callback(null, false);
};
