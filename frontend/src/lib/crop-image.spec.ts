import { describe, expect, it, vi, beforeEach } from 'vitest';

import { cropToFile, OUTPUT_SIZE } from './crop-image';

/**
 * jsdom no implementa el canvas, así que se simulan las dos piezas que usa
 * el helper: la carga de la imagen y el canvas de destino.
 */
const drawImage = vi.fn();
let canvas: {
  width: number;
  height: number;
  getContext: () => { drawImage: typeof drawImage } | null;
  toBlob: (cb: (b: Blob | null) => void) => void;
};

beforeEach(() => {
  drawImage.mockClear();

  canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage }),
    toBlob: (cb) => cb(new Blob(['x'], { type: 'image/webp' })),
  };
  vi.spyOn(document, 'createElement').mockImplementation(((tag: string) =>
    tag === 'canvas' ? canvas : ({} as HTMLElement)) as never);

  // La imagen "carga" en cuanto se le asigna el src.
  class FakeImage {
    onload: (() => void) | null = null;
    listeners: Record<string, () => void> = {};
    addEventListener(type: string, fn: () => void) {
      this.listeners[type] = fn;
    }
    set src(_value: string) {
      queueMicrotask(() => this.listeners.load?.());
    }
  }
  vi.stubGlobal('Image', FakeImage);
});

describe('cropToFile', () => {
  const crop = { x: 10, y: 20, width: 400, height: 400 };

  it('devuelve un File webp con el nombre original', async () => {
    const file = await cropToFile('blob:x', crop, 'manicura rusa.jpg');

    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe('manicura rusa.webp');
    expect(file.type).toBe('image/webp');
  });

  it('dibuja exactamente la región elegida', async () => {
    await cropToFile('blob:x', crop, 'foto.png');

    const [, sx, sy, sw, sh] = drawImage.mock.calls[0];
    expect([sx, sy, sw, sh]).toEqual([10, 20, 400, 400]);
  });

  it('sale cuadrado', async () => {
    await cropToFile('blob:x', crop, 'foto.png');

    expect(canvas.width).toBe(canvas.height);
  });

  it('no amplía un recorte más chico que el tamaño de salida', async () => {
    await cropToFile('blob:x', { x: 0, y: 0, width: 300, height: 300 }, 'f.png');

    // Estirar 300px a 1000px agrandaría el archivo sin agregar detalle.
    expect(canvas.width).toBe(300);
  });

  it('limita al tamaño de salida cuando el recorte es más grande', async () => {
    await cropToFile('blob:x', { x: 0, y: 0, width: 4000, height: 4000 }, 'f.png');

    expect(canvas.width).toBe(OUTPUT_SIZE);
  });

  it('usa un nombre por defecto si el archivo no tiene', async () => {
    const file = await cropToFile('blob:x', crop, '');

    expect(file.name).toBe('diseno.webp');
  });
});
