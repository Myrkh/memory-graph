#!/usr/bin/env node
/**
 * Build step for @myrkh/memory-graph CSS.
 *
 * Reads `src/styles/base.css` (the @import manifest), inlines each referenced
 * module, and writes a single `dist/styles/base.css`. Copies every theme file
 * unchanged to `dist/styles/themes/`.
 */

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

process.on('uncaughtException', (err) => {
  console.error('uncaughtException:', err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection:', err);
  process.exit(1);
});

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(HERE, '..');
const SRC_STYLES = join(PKG_ROOT, 'src', 'styles');
const DIST_STYLES = join(PKG_ROOT, 'dist', 'styles');

const IMPORT_RE = /@import\s+url\((['"]?)([^'")]+)\1\);?/g;

async function inlineImports(cssPath, seen) {
  const abs = resolve(cssPath);
  if (seen.has(abs)) {
    throw new Error(`Circular @import detected at ${relative(PKG_ROOT, abs)}`);
  }
  const nextSeen = new Set(seen);
  nextSeen.add(abs);

  const raw = await readFile(abs, 'utf8');
  const matches = [...raw.matchAll(IMPORT_RE)];
  if (matches.length === 0) return raw;

  let out = '';
  let cursor = 0;
  for (const match of matches) {
    out += raw.slice(cursor, match.index);
    const importedPath = resolve(dirname(abs), match[2]);
    out += `/* ↳ inlined from ${relative(PKG_ROOT, importedPath)} */\n`;
    out += await inlineImports(importedPath, nextSeen);
    cursor = match.index + match[0].length;
  }
  out += raw.slice(cursor);
  return out;
}

async function copyThemes() {
  const srcThemesDir = join(SRC_STYLES, 'themes');
  const distThemesDir = join(DIST_STYLES, 'themes');
  await mkdir(distThemesDir, { recursive: true });
  const entries = await readdir(srcThemesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.css')) continue;
    await writeFile(
      join(distThemesDir, entry.name),
      await readFile(join(srcThemesDir, entry.name), 'utf8'),
    );
  }
}

async function main() {
  console.log('build-styles: start');
  await rm(DIST_STYLES, { recursive: true, force: true });
  await mkdir(DIST_STYLES, { recursive: true });

  const bundled = await inlineImports(join(SRC_STYLES, 'base.css'), new Set());
  const header =
    '/* @myrkh/memory-graph · base.css — generated, do not edit. */\n\n';
  await writeFile(join(DIST_STYLES, 'base.css'), header + bundled);

  await copyThemes();

  const bytes = Buffer.byteLength(bundled, 'utf8');
  console.log(`✓ dist/styles/base.css · ${(bytes / 1024).toFixed(1)} KB`);
}

await main();
