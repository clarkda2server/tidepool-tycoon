/**
 * Generates every app icon from one procedural SVG (no external art).
 * Run: npm run icons   (also runs automatically before `npm run build`)
 */
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

/**
 * A round, friendly fish swimming past a glowing pearl, on deep night-water.
 * `pad` shrinks the artwork toward the centre so maskable icons survive cropping.
 */
export function iconSvg({ pad = 0, rounded = false }: { pad?: number; rounded?: boolean } = {}): string {
  const s = 1 - pad * 2;
  const t = 512 * pad;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="water" cx="50%" cy="30%" r="80%">
      <stop offset="0" stop-color="#16345c"/>
      <stop offset="0.55" stop-color="#0b1d38"/>
      <stop offset="1" stop-color="#050b16"/>
    </radialGradient>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffb066"/>
      <stop offset="0.6" stop-color="#ff7a59"/>
      <stop offset="1" stop-color="#e2557a"/>
    </linearGradient>
    <linearGradient id="belly" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe2b8" stop-opacity="0"/>
      <stop offset="1" stop-color="#ffe9c9" stop-opacity="0.9"/>
    </linearGradient>
    <radialGradient id="pearl" cx="38%" cy="35%" r="70%">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.4" stop-color="#e6ecff"/>
      <stop offset="1" stop-color="#9aa8d8"/>
    </radialGradient>
    <radialGradient id="pearlGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#9fd8ff" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#9fd8ff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="rays" cx="50%" cy="0%" r="100%">
      <stop offset="0" stop-color="#7fc8ff" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#7fc8ff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" ${rounded ? 'rx="112"' : ''} fill="url(#water)"/>
  <rect width="512" height="512" ${rounded ? 'rx="112"' : ''} fill="url(#rays)"/>
  <g transform="translate(${t} ${t}) scale(${s})">
    <!-- bubbles -->
    <circle cx="400" cy="120" r="14" fill="none" stroke="#9fd8ff" stroke-opacity="0.55" stroke-width="5"/>
    <circle cx="430" cy="78" r="8" fill="none" stroke="#9fd8ff" stroke-opacity="0.4" stroke-width="4"/>
    <circle cx="372" cy="70" r="6" fill="none" stroke="#9fd8ff" stroke-opacity="0.3" stroke-width="3"/>
    <!-- pearl -->
    <circle cx="132" cy="378" r="96" fill="url(#pearlGlow)"/>
    <circle cx="132" cy="378" r="46" fill="url(#pearl)"/>
    <ellipse cx="118" cy="362" rx="14" ry="9" fill="#fff" opacity="0.85"/>
    <!-- fish -->
    <g transform="rotate(-8 290 250)">
      <path d="M392 250 L470 186 Q458 250 470 314 Z" fill="#e2557a"/>
      <path d="M392 250 L462 200 Q452 250 462 300 Z" fill="#ff8d6b" opacity="0.6"/>
      <path d="M250 150 Q300 98 350 160 Z" fill="#e2557a"/>
      <ellipse cx="282" cy="252" rx="132" ry="108" fill="url(#body)"/>
      <ellipse cx="282" cy="290" rx="112" ry="62" fill="url(#belly)"/>
      <path d="M318 160 Q340 252 318 344" stroke="#ffd29a" stroke-opacity="0.45" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M262 278 Q300 320 286 352 Q250 330 262 278 Z" fill="#e2557a" opacity="0.85"/>
      <circle cx="210" cy="226" r="34" fill="#fff"/>
      <circle cx="202" cy="230" r="21" fill="#0b1d38"/>
      <circle cx="194" cy="222" r="8" fill="#fff"/>
      <path d="M160 274 Q172 290 188 282" stroke="#7a2440" stroke-width="7" fill="none" stroke-linecap="round"/>
      <ellipse cx="236" cy="272" rx="14" ry="8" fill="#ff5f8a" opacity="0.45"/>
    </g>
  </g>
</svg>`;
}

function png(svg: string, size: number): Buffer {
  return new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
}

const plain = iconSvg();
writeFileSync(join(outDir, 'icon.svg'), iconSvg({ rounded: true }));
writeFileSync(join(outDir, 'apple-touch-icon-180.png'), png(plain, 180));
writeFileSync(join(outDir, 'icon-192.png'), png(plain, 192));
writeFileSync(join(outDir, 'icon-512.png'), png(plain, 512));
writeFileSync(join(outDir, 'icon-maskable-512.png'), png(iconSvg({ pad: 0.1 }), 512));
console.log('icons written to', outDir);
