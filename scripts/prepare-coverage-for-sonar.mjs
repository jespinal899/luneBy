// Copia la cobertura de backend/ y frontend/ a coverage/ en la raíz del
// repo, y reescribe las rutas `SF:` de cada lcov para que queden relativas
// a la raíz (Sonar y el checklist de calidad las esperan así) en vez de
// relativas a `backend/src` o a `frontend/` (que es como las escribe cada
// herramienta, porque cada una corre con su propio `rootDir`/cwd).
//
// Uso: node scripts/prepare-coverage-for-sonar.mjs
// (después de correr, en cada paquete: `npm run test:cov`)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const dest = join(repoRoot, 'coverage');
mkdirSync(dest, { recursive: true });

function prefixLcov(lcovText, prefix) {
  return lcovText.replace(/^SF:(.*)$/gm, (_m, p) => {
    const clean = p.split('\\').join('/');
    const withPrefix = clean.startsWith(`${prefix}/`) ? clean : `${prefix}/${clean}`;
    return `SF:${withPrefix}`;
  });
}

// --- Backend (Jest, rootDir = backend/src) ---
const backendSrc = join(repoRoot, 'backend', 'coverage');
if (!existsSync(backendSrc)) {
  console.error(
    'No existe backend/coverage — corré antes: cd backend && npm run test:cov -- --coverageReporters=json-summary --coverageReporters=lcov',
  );
  process.exit(1);
}
writeFileSync(
  join(dest, 'coverage-summary.json'),
  readFileSync(join(backendSrc, 'coverage-summary.json')),
);
const backendLcov = prefixLcov(
  readFileSync(join(backendSrc, 'lcov.info'), 'utf8'),
  'backend',
);

// --- Frontend (Vitest, cwd = frontend/) ---
const frontendSrc = join(repoRoot, 'frontend', 'coverage');
let combinedLcov = backendLcov;
if (existsSync(join(frontendSrc, 'lcov.info'))) {
  const frontendLcov = prefixLcov(
    readFileSync(join(frontendSrc, 'lcov.info'), 'utf8'),
    'frontend',
  );
  combinedLcov = `${backendLcov}\n${frontendLcov}`;
} else {
  console.warn(
    'No existe frontend/coverage/lcov.info — corré `cd frontend && npm run test:cov` antes si querés incluirlo. Se sigue solo con el del backend.',
  );
}

writeFileSync(join(dest, 'lcov.info'), combinedLcov);

console.log('coverage/coverage-summary.json y coverage/lcov.info listos.');
