import { fileFilter } from './file-filter.helper';

describe('fileFilter', () => {
  const makeFile = (mimetype: string) => ({ mimetype }) as Express.Multer.File;

  it('acepta jpg, png y webp', () => {
    for (const mime of ['image/jpg', 'image/png', 'image/webp']) {
      const callback = jest.fn();
      fileFilter(undefined as never, makeFile(mime), callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    }
  });

  it('acepta jpeg (case-insensitive)', () => {
    const callback = jest.fn();
    fileFilter(undefined as never, makeFile('image/JPEG'), callback);
    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it('rechaza otros tipos (pdf, gif, etc.)', () => {
    const callback = jest.fn();
    fileFilter(undefined as never, makeFile('application/pdf'), callback);
    expect(callback).toHaveBeenCalledWith(null, false);
  });
});
