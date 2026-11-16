import { cp, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await stat(path.join(root, 'dist/index.html'));
await cp(path.join(root, 'dist'), path.join(root, 'docs'), { recursive: true });
await writeFile(path.join(root, 'docs/.nojekyll'), '');
console.log('Copied the built website to docs/ for GitHub Pages branch publishing.');
