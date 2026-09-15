/** Región recortada, en píxeles de la imagen original (la que da react-easy-crop). */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Lado del lienzo de salida. Coincide con el máximo que aplica el backend
 * (sharp redimensiona a 1000px), así que subir más grande no aporta nada:
 * solo hace la subida más lenta desde el celular del salón.
 */
export const OUTPUT_SIZE = 1000;

/** Carga un archivo como imagen decodificada, lista para dibujar en un canvas. */
export const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () =>
      reject(new Error('No se pudo leer la imagen')),
    );
    image.src = src;
  });

/**
 * Recorta la región elegida y devuelve un archivo cuadrado listo para subir.
 *
 * Se recorta en el navegador, antes de subir, por dos motivos: la foto viaja
 * más liviana (importa cuando Kelin sube desde el celular con datos), y la
 * parte visible la decide ella y no el `object-cover` del navegador.
 */
export async function cropToFile(
  imageSrc: string,
  crop: CropArea,
  fileName: string,
  size: number = OUTPUT_SIZE,
): Promise<File> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('No se pudo preparar el recorte');

  // Nunca ampliar más allá del recorte original: estirar píxeles solo
  // agrandaría el archivo sin agregar detalle.
  const side = Math.min(size, Math.round(crop.width));
  canvas.width = side;
  canvas.height = side;

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    side,
    side,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.9),
  );
  if (!blob) throw new Error('No se pudo generar la imagen recortada');

  const base = fileName.replace(/\.[^.]+$/, '') || 'diseno';
  return new File([blob], `${base}.webp`, { type: 'image/webp' });
}
