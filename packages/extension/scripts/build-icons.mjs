#!/usr/bin/env node
/**
 * Render public/icon.svg into PNG rasters at the sizes Chrome expects
 * for the manifest (48, 128). Uses @resvg/resvg-js — pure JS, no native
 * binary, no system libvips dependency. Runs as a prebuild step.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const SVG_PATH = resolve(ROOT, 'public/icon.svg');
const SIZES = [48, 128];

const svg = readFileSync(SVG_PATH);

for (const size of SIZES) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  });
  const pngData = resvg.render().asPng();
  const out = resolve(ROOT, `public/icon-${size}.png`);
  writeFileSync(out, pngData);
  console.log(`✓ icon-${size}.png (${pngData.byteLength} bytes)`);
}
