import { cp, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = resolve(projectRoot, 'src/assets/store');
const publicDir = resolve(projectRoot, 'public/assets/store');

if (!existsSync(sourceDir)) {
  console.log('No src/assets/store folder found. Skipping store asset sync.');
  process.exit(0);
}

await mkdir(publicDir, { recursive: true });
await cp(sourceDir, publicDir, {
  recursive: true,
  force: true,
});

console.log('Store assets synced from src/assets/store to public/assets/store.');
