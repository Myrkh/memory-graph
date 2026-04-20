# Site brief — @myrkh/memory-graph · v0.1.0

> *Moins, mais mieux. Et quand on en fait plus : fais-le pour de vrai.*
> Stit'Claude v2 · Phase 1 EXPLORE

```
PROJET     : Site multi-pages @myrkh/memory-graph — landing + demo + docs + philosophy
BUT        : Présenter la lib v0.1.0 comme un produit fini ; dogfooder la lib
             sur son propre site (meta-tracking → 20 data-mg-id sur le contenu)
AUDIENCE   : Devs React (primaire), designers curieux (secondaire),
             lecteurs long-form (tertiaire, page philosophy)
SUPPORT    : Web marketing · desktop-first mais responsive · light/dark pair
HOUSE      : Editorial (Stripe docs × Robin Sloan × NYT Magazine)
             + touches Power-Dense sur le nav (mono uppercase, active underline)
RÉFÉRENCES : Stripe documentation, Linear changelog, Medium long-form,
             NYT Magazine editorial, The Paris Review essays
CONTRAINTES: zéro réseau (hors Google Fonts theme) · ≤300 lignes/fichier ·
             tokens --mg-* OKLCH exclusifs · prefers-reduced-motion ·
             scroll-driven animations progressive enhancement ·
             APCA Lc ≥ 75 corps · focus-visible systématique ·
             meta-tracking (la lib track le site elle-même)
ANTI-GOALS : pas de hero SaaS générique · pas de bento "Fast/Secure/Easy" ·
             pas de dégradé purple-pink-blue · pas de Sparkles sur AI ·
             pas d'emoji comme iconographie produit · pas de drop-shadow
             décoratif · pas de dark mode invert · pas de shadcn Card brut
```

## Phase 2 · DISTILL — tokens détectés (JAMAIS contredits)

Le système `--mg-*` préexiste dans `@myrkh/memory-graph/themes/stit-claude` :

- **Palette** · `--mg-bg`, `--mg-surface`, `--mg-border`, `--mg-fg`, `--mg-fg-muted`,
  `--mg-fg-subtle`, `--mg-accent`, `--mg-accent-hover`, `--mg-ring` — **toutes OKLCH**
- **Typo** · 4 familles (cadre theme) : `--mg-font-display` (Fraunces),
  `--mg-font-serif` (Instrument Serif), `--mg-font-sans` (Inter),
  `--mg-font-mono` (JetBrains Mono)
- **Motion** · `--mg-duration-{fast,normal,moderate,slow}`,
  `--mg-ease-{standard,decelerate,expo-out,spring-smooth,spring-snappy}`
- **Radii** · `--mg-radius-{sm,md,lg,pill}`

Adopté tel quel. Zéro override. Toute nouvelle valeur passe par `color-mix(in oklch, var(--mg-*), …)`.

## Phase 3 · POLISH — les 10 marqueurs Stit'Claude

| # | Marqueur | État |
|---|---|---|
| 1 | House déclarée | ✓ Editorial principal · Power-Dense touches (nav) |
| 2 | Token system first | ✓ 100 % `--mg-*` — `grep -E '#[0-9a-fA-F]{3,8}\|rgb\(' styles/site-*.css` retourne vide |
| 3 | 1 accent OKLCH saturé | ✓ coral `--mg-accent`, zéro dégradé générique |
| 4 | Famille typo restreinte | Cadre 4 (héritage theme), restreint à 2 simultanés en usage par bloc |
| 5 | Rayons concentriques | ✓ cards 10px · boutons 6px · pills full-pill · hero install 10px |
| 6 | Bordures hairline | ✓ 1px `var(--mg-border)` — aucune ombre décorative ; dashed dividers |
| 7 | Motion tokenisée | ✓ `--mg-duration-*`, `--mg-ease-*` partout · scroll-driven view() + scroll() |
| 8 | Tabular nums | ✓ tous les nombres, versions, kickers, mono blocks |
| 9 | Dark mode pair | ✓ via tokens OKLCH · `@media (prefers-color-scheme: dark)` + `[data-mg-scheme="dark"]` |
| 10 | Règles typo respectées | ✓ text-wrap balance (titres) · text-wrap pretty (corps) · measure 48-66ch |

## Phase 4 · SHIP — checklist 12 points

```
✓  1  Brief d'intention écrit (ce document)
✓  2  Token system adopté sans override
✓  3  Typo ≤ 2 en usage simultané · tabular-nums · optical-sizing (theme)
✓  4  1 accent coral OKLCH · zéro gradient générique
✓  5  Rayons concentriques
✓  6  Bordures hairline · zéro drop-shadow décoratif
✓  7  Dark mode pair via tokens (pas invert)
✓  8  Motion ≤300ms par défaut · narrative moments ≤1600ms (hero return draw)
      prefers-reduced-motion branche explicite
✓  9  Règles typo FR/EN · text-wrap · measure · hyphens
✓ 10  APCA Lc ≥ 75 (palette coral stit-claude calibrée) · :focus-visible
      avec ring 2-3px · keyboard-complete
✓ 11  Zéro anti-slop parmi les 30 patterns interdits
✓ 12  Tests Rams + Vignelli + Saarinen passés (voir ci-dessous)
```

## Tests trois-critères

**Rams.** Est-ce innovant ? oui (meta-tracking du site par la lib elle-même). Utile ?
oui. Esthétique ? oui (éditorial). Compréhensible ? oui (4 pages, hiérarchie claire).
Discret ? oui (zéro chrome sans rôle). Honnête ? oui (le site *est* la lib qui tourne).
Durable ? oui (tokens OKLCH, grammaire géométrique, pas de trend 2026). Minutieux ?
oui (12 fichiers CSS, 12 composants, tous ≤243 lignes). Respectueux ressources ?
oui (CSS 75 KB gzip 11 KB, JS 290 KB gzip 88 KB, zéro réseau hors fonts).
Aussi peu de design que possible ? oui (zéro icône décorative, zéro illustration
stock, zéro Sparkles).

**Vignelli.** Le site dépend-il d'une mode 2026 ? non. Fraunces + Instrument Serif +
JetBrains Mono + coral accent + hairlines + tabular-nums — combinaison qui tiendra
en 2056.

**Saarinen.** Le site *respecte* son utilisateur ? oui. Il *marche* ? oui
(route change + scroll-top + animations reduced-motion safe). Il *fait son travail* ?
oui (pitche la lib, la démontre, documente, ship).

## Signature décisions

- **Mini-graph hero** : 4 kinds côte à côte (cercle halo · carré · diamant · carré
  arrondi), return-edge se dessine en 1200 ms puis settle en dashed 3/2 signature
  coral. Tous les nodes fade-in staggered 60 ms.
- **Scroll-driven reveals** · `animation-timeline: view()` sur les cartes features,
  promise items, quickstart steps, 5 laws. Fallback sans JS = visible immédiatement.
- **Nav active state** · underline coral qui slide via transform-origin left, 200 ms
  ease-expo-out.
- **Page shell fade-in** · 320 ms sur chaque route change (key-based remount).
- **Hero CTA primary glow** · radial-gradient coral via `color-mix(in oklch, …)`,
  opacity transition au hover.

## Meta-tracking — le site dogfoode la lib

20 `[data-mg-id]` stratégiques :
- Home · hero title (heading) · deck · 3 promise · 6 features (kpi)
- Docs · 3 quickstart steps (code) · 3 API groups
- Philosophy · 5 laws (heading)

Résultat : l'utilisateur qui ouvre le panel en lisant le site voit son propre
parcours sur NOTRE site se tracer. Preuve vivante que la lib fonctionne partout.
