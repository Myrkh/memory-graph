/**
 * Source of truth for the Chrome extension's theme gallery.
 *
 * Each entry corresponds to a CSS file shipped by `@myrkh/memory-graph`
 * under `./themes/<id>`. The metadata below drives the ThemeShop picker
 * (label, house, one-line deck) and the storage layer.
 *
 * Each theme is designed around a SIGNATURE visual moment, not just a
 * palette swap — see the per-theme CSS header for the move (radial sun
 * on Solaris, washi fiber on Kyoto, ivory-on-obsidian on Obsidian,
 * pixel grid on Arcade, amber signal on Plex). When adding a new one :
 *
 *   1. Drop its CSS under `packages/core/src/styles/themes/<id>.css`
 *   2. Expose it via `packages/core/package.json` → `./themes/<id>`
 *   3. Add the entry here (id, label, house, tagline, free/premium)
 *   4. Add the `?raw` import in `content-app.tsx` + the stylesheet
 *      import in `sidepanel.tsx` so BOTH runtimes pick it up.
 */

export type ThemeId =
  | 'stit-claude'
  | 'plex'
  | 'solaris'
  | 'obsidian'
  | 'kyoto'
  | 'arcade';

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  house: string;
  /** Evocative one-liner shown on the shop card. */
  tagline: string;
  /** Free theme ships unlocked ; premium themes gate behind purchase
   * once the license layer lands. Today : all themes apply on click,
   * the `premium` flag is carried forward as presentation-only. */
  tier: 'free' | 'premium';
}

export const DEFAULT_THEME: ThemeId = 'stit-claude';

export const THEME_CATALOG: ThemeMeta[] = [
  {
    id: 'stit-claude',
    label: 'Stit’Claude',
    house: 'Editorial · Warm',
    tagline: 'La maison. Fraunces italic, coral, papier.',
    tier: 'free',
  },
  {
    id: 'solaris',
    label: 'Solaris',
    house: 'Editorial · Sunset',
    tagline: 'Soleil couchant sur la Villa Malaparte.',
    tier: 'premium',
  },
  {
    id: 'obsidian',
    label: 'Obsidian',
    house: 'Editorial · Noir',
    tagline: 'Bibliothèque privée, Playfair, accent ivoire.',
    tier: 'premium',
  },
  {
    id: 'kyoto',
    label: 'Kyoto',
    house: 'Japanese · Refined',
    tagline: 'Washi, vermillon, céladon. Temple de thé.',
    tier: 'premium',
  },
  {
    id: 'arcade',
    label: 'Arcade',
    house: 'Playful · Confident',
    tagline: 'Grille 16, Bricolage, orange OP-1.',
    tier: 'premium',
  },
  {
    id: 'plex',
    label: 'Plex',
    house: 'Industrial · Pro',
    tagline: 'Terminal Bloomberg, amber signal, IBM Plex.',
    tier: 'premium',
  },
];

export function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === 'string' &&
    THEME_CATALOG.some((t) => t.id === value)
  );
}
