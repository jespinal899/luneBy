jest.mock('node:fs', () => ({
  existsSync: jest.fn(() => false),
  mkdirSync: jest.fn(),
}));

import { existsSync, mkdirSync } from 'node:fs';

import { FilesModule } from './files.module';

describe('FilesModule', () => {
  it('crea la carpeta de subida si no existe', () => {
    expect(FilesModule).toBeDefined();
    expect(existsSync).toHaveBeenCalled();
    expect(mkdirSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ recursive: true }),
    );
  });
});
