// Copia backend/coverage/{coverage-summary.json,lcov.info} a coverage/ en la
// raíz del repo, y reescribe las rutas `SF:` del lcov para que queden
// relativas a la raíz (Sonar y el checklist de calidad las esperan así),
// no relativas a `backend/src` (que es como las escribe Jest, porque su
// `rootDir` es `backend/src`).
//
// Uso: node scripts/prepare-coverage-for-sonar.mjs
// (después de correr `npm run test:cov` dentro de backend/)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(repoRoot, 'backend', 'coverage');
const dest = join(repoRoot, 'coverage');

if (!existsSync(src)) {
  console.error(
    'No existe backend/coverage — corré antes: cd backend && npm run test:cov -- --coverageReporters=json-summary --coverageReporters=lcov',
  );
  process.exit(1);
}

mkdirSync(dest, { recursive: true });

// coverage-summary.json se copia tal cual (no lleva rutas de archivo).
writeFileSync(
  join(dest, 'coverage-summary.json'),
  readFileSync(join(src, 'coverage-summary.json')),
);

// lcov.info: SF:src\foo.ts (relativo a backend/src) -> SF:backend/src/foo.ts
let lcov = readFileSync(join(src, 'lcov.info'), 'utf8');
lcov = lcov.replace(/^SF:(.*)$/gm, (_m, p) => {
  const clean = p.split('\\').join('/');
  const withBackend = clean.startsWith('backend/') ? clean : `backend/${clean}`;
  return `SF:${withBackend}`;
});
writeFileSync(join(dest, 'lcov.info'), lcov);

console.log('coverage/coverage-summary.json y coverage/lcov.info listos.');
