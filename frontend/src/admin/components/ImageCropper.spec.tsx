import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// El código fuente como texto (import nativo de Vite), para la guarda de
// abajo. Evita depender de node:fs, que no corresponde en código de navegador.
import fuenteDelComponente from './ImageCropper.tsx?raw';
// La configuración de despliegue, como texto: la vista previa depende de que
// la CSP permita el esquema blob:.
import vercelJson from '../../../vercel.json?raw';

const AREA = { x: 5, y: 10, width: 300, height: 300 };

// Se simula la librería de recorte: lo que se prueba acá es la lógica propia
// (confirmar, cancelar, manejar el fallo), no el arrastre de un tercero, que
// además no funciona en jsdom. El botón expuesto dispara onCropComplete igual
// que lo haría la interacción real.
vi.mock('react-easy-crop', () => ({
  default: ({
    onCropComplete,
    zoom,
  }: {
    onCropComplete: (a: unknown, b: typeof AREA) => void;
    zoom: number;
  }) => (
    <button type="button" data-zoom={zoom} onClick={() => onCropComplete({}, AREA)}>
      simular recorte
    </button>
  ),
}));

const cropToFile = vi.fn();
vi.mock('@/lib/crop-image', () => ({
  cropToFile: (...args: unknown[]) => cropToFile(...args),
}));

import { ImageCropper } from './ImageCropper';

const file = new File(['x'], 'manicura.jpg', { type: 'image/jpeg' });

const setup = (props: Partial<Parameters<typeof ImageCropper>[0]> = {}) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ImageCropper
      file={file}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { onConfirm, onCancel };
};

beforeEach(() => {
  cropToFile.mockReset();
  cropToFile.mockResolvedValue(new File(['y'], 'manicura.webp'));
  // jsdom no implementa las URLs de objeto. Se reemplazan solo esos dos
  // métodos: sustituir el global entero rompería `new URL(...)`.
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
});

describe('ImageCropper', () => {
  it('muestra el recorte sobre la foto elegida', () => {
    setup();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  it('cancelar avisa al formulario y no recorta nada', async () => {
    const user = userEvent.setup();
    const { onCancel } = setup();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalled();
    expect(cropToFile).not.toHaveBeenCalled();
  });

  it('no intenta recortar si todavía no se eligió una región', async () => {
    const user = userEvent.setup();
    const { onConfirm } = setup();

    await user.click(screen.getByRole('button', { name: /recortar y subir/i }));

    expect(cropToFile).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('recorta la región elegida y entrega el archivo resultante', async () => {
    const user = userEvent.setup();
    const { onConfirm } = setup();

    await user.click(screen.getByText('simular recorte'));
    await user.click(screen.getByRole('button', { name: /recortar y subir/i }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    expect(cropToFile).toHaveBeenCalledWith('blob:preview', AREA, 'manicura.jpg');
    expect(onConfirm.mock.calls[0][0]).toBeInstanceOf(File);
  });

  it('si el recorte falla, lo dice y deja reintentar', async () => {
    cropToFile.mockRejectedValue(new Error('canvas roto'));
    const user = userEvent.setup();
    const { onConfirm } = setup();

    await user.click(screen.getByText('simular recorte'));
    await user.click(screen.getByRole('button', { name: /recortar y subir/i }));

    expect(
      await screen.findByText(/no se pudo recortar la imagen/i),
    ).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
    // El botón vuelve a estar disponible: el fallo no deja el modal trabado.
    expect(
      screen.getByRole('button', { name: /recortar y subir/i }),
    ).toBeEnabled();
  });

  it('mientras sube, bloquea los botones y lo indica', () => {
    setup({ isUploading: true });

    expect(screen.getByRole('button', { name: /subiendo/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });

  it('el control de zoom ajusta el acercamiento', () => {
    setup();

    const zoom = screen.getByLabelText(/acercar o alejar/i);
    expect(screen.getByText('simular recorte')).toHaveAttribute('data-zoom', '1');

    // Un input range se mueve con change, no escribiendo dentro.
    fireEvent.change(zoom, { target: { value: '2.5' } });

    expect(screen.getByText('simular recorte')).toHaveAttribute(
      'data-zoom',
      '2.5',
    );
  });

  // Los casos de arriba mockean react-easy-crop, así que por construcción no
  // pueden detectar que falte su hoja de estilos: sin ella el contenedor
  // colapsa y el reset de Tailwind (img { max-width: 100% }) deforma la foto.
  // Pasó en producción. Esta guarda evita que se vuelva a quitar.
  it('importa la hoja de estilos de react-easy-crop', () => {
    expect(fuenteDelComponente).toContain('react-easy-crop/react-easy-crop.css');
  });

  // La vista previa usa URL.createObjectURL(archivo), que devuelve una URL
  // blob:. La CSP es una lista blanca: si img-src no la incluye, el navegador
  // bloquea la imagen y el recorte se ve en blanco. Pasó en producción.
  it('la CSP permite blob: en img-src, que es lo que usa la vista previa', () => {
    expect(fuenteDelComponente).toContain('createObjectURL');

    const imgSrc = vercelJson
      .split(';')
      .find((directiva) => directiva.includes('img-src'));

    expect(imgSrc).toBeDefined();
    expect(imgSrc).toContain('blob:');
  });
});
