// Optimiza los assets pesados del repo: los reduce de tamaño y los pasa a WebP.
// Uso: node scripts/optimize-images.mjs
import { readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const assets = dirname(fileURLToPath(import.meta.url)) + '/../src/assets';

/** [origen, destino, ancho máximo, opciones webp] */
const jobs = [
  ['service-acrylic.jpg', 'service-acrylic.webp', 900, { quality: 72 }],
  ['service-gel.jpg', 'service-gel.webp', 900, { quality: 72 }],
  ['service-nailart.jpg', 'service-nailart.webp', 900, { quality: 72 }],
  // El hero se ve más grande: un poco más de ancho y calidad.
  ['service-nailart.jpg', 'hero-nailart.webp', 1400, { quality: 74 }],
  ['logoby.png', 'logoby.webp', 480, { quality: 82, alpha: true }],
];

for (const [from, to, width, opts] of jobs) {
  const src = join(assets, from);
  const dst = join(assets, to);
  const input = await readFile(src);
  const pipeline = sharp(input).resize({ width, withoutEnlargement: true });
  const output = await pipeline.webp(opts).toBuffer();
  await writeFile(dst, output);

  const before = (await stat(src)).size;
  const after = output.length;
  console.log(
    `${to.padEnd(24)} ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`,
  );
}
