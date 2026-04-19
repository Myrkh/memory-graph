# references/typography.md — La typographie comme métier

> *Charge ce fichier quand tu choisis une police, un type scale, ou quand tu polis la micro-typo d'un projet.*

La typographie est **80% du design**. Si les polices et les proportions sont justes, le reste suit. Si elles sont fausses, rien ne peut sauver le design.

---

## I. La bibliothèque — les polices cultes 2026

### Les sans-serifs pros

| Police | Fonderie | Licence | Usage idéal |
|---|---|---|---|
| **Inter** (+ Inter Display) | Rasmus Andersson (rsms.me) | OFL | Défaut SaaS, UI produit, 9–18px |
| **Geist Sans** / Mono / Pixel | Vercel | OFL | Outils dev, Next.js défaut, signal brutaliste |
| **IBM Plex Sans** / Serif / Mono | IBM | OFL | Enterprise, technique, normatif |
| **Söhne** | Klim Type Foundry (Kris Sowersby) | Commerciale | High-craft SaaS, éditorial |
| **Neue Haas Grotesk** | Commercial Type | Commerciale | Helvetica reboot correct |
| **GT America** | Grilli Type | Commerciale | Grotesque américaine, Condensed signature |
| **Suisse International** | Swiss Typefaces | Commerciale | Studios européens, tech |
| **Monument Grotesk** | PangramPangram | Commerciale abordable | SaaS contemporain avec caractère |
| **ABC Diatype** | Dinamo | Commerciale | SaaS moderne |

### Les serifs

| Police | Fonderie | Licence | Usage idéal |
|---|---|---|---|
| **Tiempos Text** / Headline | Klim | Commerciale | Éditorial haut de gamme |
| **Source Serif 4** | Adobe | OFL | Corps de texte |
| **IBM Plex Serif** | IBM | OFL | Rapports techniques |
| **Libertinus** | Forks OFL | OFL | Math-friendly, libre |
| **EB Garamond** | George Duffner | OFL | Classique universel |
| **Cormorant Infant** | Christian Thalmann | OFL | Délicat, display |
| **Fraunces** | Undercase Type | OFL | Moderne joueur (SOFT axis variable) |
| **Instrument Serif** | Instrument | OFL | Hero headline serif chic |
| **PP Editorial New** | Pangram | Abordable | Éditorial italique dramatique |
| **Playfair Display** | Claus Eggers Sørensen | OFL | Display serif (à éviter : saturé) |

### Les monospaces

| Police | Fonderie | Licence | Usage idéal |
|---|---|---|---|
| **JetBrains Mono** | JetBrains | OFL | Code, tableaux numériques |
| **Geist Mono** | Vercel | OFL | Moderne dev, signalement tech |
| **IBM Plex Mono** | IBM | OFL | Rapports, tables techniques |
| **Berkeley Mono** | US Graphics | Commerciale ~$75–200 | Signature indie-dev |
| **Iosevka** | Belleve Invis | OFL | Customizable, compact |
| **Fira Code** | Mozilla | OFL | Ligatures code |
| **Cascadia Code** | Microsoft | OFL | Windows Terminal |
| **Monaspace** (5 familles) | GitHub | OFL | Texture healing, mix-metrics |
| **SF Mono** | Apple | Apple uniquement | Apps Apple natives |
| **Recursive Mono** | Arrow Type | OFL | Variable mono↔sans |

### Les variables à connaître

- **Recursive** (Arrow Type) — sans ↔ mono dans la même variable, 3 autres axes (wght, casual, crsv).
- **Roboto Flex** (Google) — **13 axes**. Le Swiss Army knife.
- **Fraunces** — axes SOFT, WONK, opsz. Personnalité modulable.
- **Inter 4+** — maintenant variable avec opsz.
- **Mona Sans** + **Hubot Sans** (GitHub) — mates, open-source.

### Les polices Apple (Apple-only)

**SF Pro** / SF Pro Display / SF Pro Rounded / SF Mono. À utiliser **uniquement** dans les apps Apple natives (SwiftUI, AppKit). En web, le fallback `-apple-system` la prend quand disponible.

```css
font-family: -apple-system, "BlinkMacSystemFont", "SF Pro", "Inter", system-ui, sans-serif;
```

---

## II. Type scale — le nombre d'or, les tierces, les quartes

### Les ratios classiques

| Nom | Ratio | Usage idéal |
|---|---|---|
| Minor second | 1.067 | Ultra-dense (cockpit, terminal) |
| Major second | 1.125 | Dense admin/data |
| Minor third | 1.200 | Dense SaaS |
| **Major third** | **1.250** | **Défaut SaaS** ✓ |
| **Perfect fourth** | **1.333** | **Défaut éditorial** ✓ |
| Augmented fourth | 1.414 | Éditorial expressif |
| Perfect fifth | 1.500 | Marketing |
| Golden ratio | 1.618 | Art-directed, portfolio |
| Widescreen | 1.778 | Dramatique |

### Implémentation fluide (pattern Utopia)

Utopia — système de James Gilyead et Trys Mudford pour type fluide sans breakpoints.

```css
:root {
  /* Type scale fluide basée sur 1.2 mobile → 1.333 desktop, 320px → 1440px */
  --step--2: clamp(0.7813rem, 0.7747rem + 0.0330vw, 0.8rem);
  --step--1: clamp(0.9375rem, 0.9119rem + 0.1136vw, 1.0000rem);
  --step-0:  clamp(1.1250rem, 1.0739rem + 0.2273vw, 1.2500rem);
  --step-1:  clamp(1.3500rem, 1.2608rem + 0.3967vw, 1.5625rem);
  --step-2:  clamp(1.6200rem, 1.4772rem + 0.6359vw, 1.9531rem);
  --step-3:  clamp(1.9440rem, 1.7269rem + 0.9672vw, 2.4414rem);
  --step-4:  clamp(2.3328rem, 2.0117rem + 1.4309vw, 3.0518rem);
  --step-5:  clamp(2.7994rem, 2.3389rem + 2.0524vw, 3.8147rem);
}

h1 { font-size: var(--step-5); }
h2 { font-size: var(--step-4); }
p  { font-size: var(--step-0); }
```

**Générateur officiel :** utopia.fyi/type/calculator

**Règle critique** : jamais de `vw` pur → zoom utilisateur cassé. Toujours `rem + vw` dans `clamp()`.

---

## III. Corps de texte — les vraies valeurs

**Tailles corps de référence (2026) :**
- **14px** — dense admin, dashboards, power-user tools (Linear-like).
- **15px** — Stripe marketing defaults.
- **16px** — défaut web standard.
- **17px** — iOS current (Dynamic Type regular).
- **18px** — éditorial, blog, long-form.
- **20px** — marketing premium (Apple landing).

**Line-height (leading) :**
- Body corps : `1.5` (défaut) à `1.7` (long-form sérif).
- Display / headlines : `1.1` (tight, dramatic) à `1.25` (confort).
- UI labels : `1.0` à `1.2`.
- Captions / micro : `1.3` à `1.4`.

**Measure (longueur de ligne) :**
- Optimal : **60–66 caractères par ligne** (avec espaces).
- Maximum absolu : 80ch.
- Minimum : 45ch.
- En CSS : `max-width: 65ch;` ou en grid avec unité `ch`.

```css
.prose {
  max-width: 65ch;
  font-size: var(--step-0);
  line-height: 1.6;
  text-wrap: pretty;
  hyphens: auto;
}
```

---

## IV. Micro-typographie — le niveau Rauno/Saarinen

### OpenType features à activer

```css
/* Body text */
.prose {
  font-variant-numeric: oldstyle-nums proportional-nums;
  font-variant-ligatures: common-ligatures contextual;
  font-kerning: normal;
  font-feature-settings: "kern", "liga", "calt";
}

/* Data tables, charts, numeric inputs */
.data, td.num, .metric {
  font-variant-numeric: tabular-nums lining-nums;
}

/* Headlines — polices variables avec optical sizing */
h1, h2 {
  font-optical-sizing: auto;
  text-wrap: balance;
  letter-spacing: -0.02em;  /* légère compression pour titres */
}

/* Body paragraphs */
p {
  text-wrap: pretty;
  hyphens: auto;
  hanging-punctuation: first;
}

/* Small caps */
.caps {
  font-variant-caps: small-caps;
  letter-spacing: 0.06em;  /* tracking positif en small caps */
}
```

### Letter-spacing (tracking) — les règles

| Contexte | Tracking |
|---|---|
| Corps de texte | 0 (jamais negative en body) |
| Headline 48px+ | -0.01em à -0.03em |
| Display 96px+ | -0.02em à -0.04em |
| All-caps label | +0.04em à +0.08em |
| Small caps | +0.06em |
| Code / mono | 0 |

### Text-wrap modernes (2023+, supported major browsers 2024+)

- **`text-wrap: balance`** — équilibre les lignes pour titres multi-lignes. **N'applique pas** sur titres 1 ligne. Pas sur paragraphes longs (coûteux).
- **`text-wrap: pretty`** — évite les "orphelins" en fin de paragraphe.

### Hanging punctuation

```css
.prose { hanging-punctuation: first last allow-end; }
```

Fait pendre les guillemets et parenthèses **hors** du bloc de texte. Niveau print-grade.

---

## V. Règles typographiques françaises

**Toujours respectées si `lang="fr"`.**

### Espaces fines insécables (U+202F)

Avant :
- `:` → `Règle : ceci.`
- `;` → `D'abord ceci ; ensuite cela.`
- `?` → `Vraiment ?`
- `!` → `Incroyable !`
- `»` → `« Elle a dit ceci. »`
- `%` → `23 %`

Après : `«`, et `—` utilisé comme tiret d'incise.

**En HTML** : `&#x202f;` ou caractère direct.
**En CSS** : non automatique. Besoin de preprocessing du contenu (JS `replace`, ou plugin Remark, ou Babel).

### Guillemets

`« guillemets français »` — pas `" "` anglais.

### Tirets

- `—` cadratin pour incise : « C'est — évidemment — ainsi. »
- `–` demi-cadratin pour intervalle : p. 12–18, 2024–2026.
- `-` trait d'union pour mots composés : rouge-gorge.

### Chiffres

- Milliers : espace fine insécable. `1 234,56` (jamais `1,234.56` ni `1234,56`).
- Décimale : virgule. `3,14`.
- Date plein : `15 janvier 2026`.
- Pourcentage : `23 %` avec espace fine.
- Monnaie : `12 €` ou `12,50 €`.

### Acceptes majuscules

**É À Ç È Ê Ï Ô Ù** — obligatoires en français. **Pas** `ECOLE` → `ÉCOLE`.

### Largeur française

Le français est typiquement **15–20% plus long** que l'équivalent anglais. Réserve la largeur dans les layouts ou accepte le wrap.

---

## VI. Règles typographiques anglaises

- **Oxford comma** : recommandé en formel (`a, b, and c`).
- **Em dash** `—` pour incise (sans espaces en US, avec espaces en UK).
- **En dash** `–` pour ranges.
- **Straight quotes** `"..."` interdites en production. Toujours `"..."` (curly).
- **Apostrophes** : `'` (curly), pas `'`.
- **Title case** pour titres (vs sentence case en FR).

---

## VII. Règles multi-langue (RTL, CJK)

### RTL (Arabe, Hébreu, Persan)

- `dir="rtl"` sur `<html>` ou conteneur.
- **Logical properties** : `margin-inline-start` (pas `margin-left`), `padding-block-start`, `inset-inline-end`.
- Flip des **icônes directionnelles** (flèches, chevrons) mais pas des autres (logos, check).
- Nombres et code restent LTR dans contexte RTL.

### CJK (Chinois, Japonais, Coréen)

- Pas d'espaces entre mots.
- **Line-break propre** : `word-break: keep-all;` ou `line-break: strict;`.
- **Vertical writing** possible : `writing-mode: vertical-rl;` (japonais traditionnel, chinois classique).
- Polices : Noto Sans CJK, Source Han Sans, PingFang (Apple), Hiragino.

---

## VIII. Polices variables — le futur présent

**Avantages :**
- Un fichier pour 9 graisses (Light à Black).
- Poids custom : `font-weight: 437` possible.
- Animation fluide : `transition: font-weight 200ms`.
- Compression — 50–80% plus petit que chargement de 9 fichiers distincts.

**Pattern recommandé :**

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter.var.woff2") format("woff2-variations");
  font-weight: 100 900;          /* range */
  font-style: normal;
  font-display: swap;
}

/* Ensuite dans les styles */
.heavy { font-weight: 720; }     /* poids custom possible */
.light-italic {
  font-weight: 320;
  font-variation-settings: "ital" 1;
}

/* Animation */
.button {
  font-weight: 500;
  transition: font-weight 200ms var(--ease-standard);
}
.button:hover { font-weight: 600; }
```

**Les 13 axes de Roboto Flex :**
- `wght` (weight), `wdth` (width), `opsz` (optical size), `slnt` (slant), `GRAD` (grade), `XTRA`, `XOPQ`, `YOPQ`, `YTLC`, `YTUC`, `YTAS`, `YTDE`, `YTFI`.

---

## IX. Font loading — la performance comme design

```html
<!-- Préchargement de la police corps (above-fold) -->
<link
  rel="preload"
  as="font"
  type="font/woff2"
  href="/fonts/Inter.var.woff2"
  crossorigin
/>
```

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter.var.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-display: swap;  /* ou 'optional' pour éviter CLS sur headline */
}

/* Pour éviter CLS : size-adjust sur fallback */
@font-face {
  font-family: "Inter Fallback";
  src: local("Arial");
  size-adjust: 107.5%;
  ascent-override: 90%;
  descent-override: 22.5%;
  line-gap-override: 0%;
}

:root {
  font-family: "Inter", "Inter Fallback", system-ui, sans-serif;
}
```

**Outil :** fontpie.com ou Capsize (`seek-oss/capsize`) pour calculer les `size-adjust` values exactes.

---

## X. La règle Stit'Claude

**≤ 2 polices par projet.** Souvent une seule, déclinée en graisses.

**Quand 2 :**
- 1 sans pour UI + 1 mono pour data (pattern le plus fréquent).
- 1 sans pour UI + 1 serif pour headlines éditoriales (pattern Stripe docs).
- 1 display pour hero + 1 sans pour corps (pattern portfolio).

**Quand 1 suffit :** Recursive, Roboto Flex, Monaspace (qui font sans+mono dans la même famille).

**Jamais 3+.** Vignelli avait raison : *"We have too many typefaces."*

Un designer Stit'Claude qui charge Inter + JetBrains Mono + Fraunces + Playfair + Space Grotesk dans la même page **doit refactorer**.
