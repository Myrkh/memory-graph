# references/color.md — La couleur comme matière

> *Charge ce fichier quand tu construis une palette, quand tu calibres un dark mode, quand tu vérifies un contraste.*

La couleur, en 2026, se pense en **OKLCH**. Les palettes légendaires (Linear, Stripe, Radix) le font déjà. L'heure des `#RRGGBB` aveugles est finie.

---

## I. OKLCH — pourquoi, comment

**OKLCH** (OK Lab Lightness, Chroma, Hue) est un espace de couleur **perceptuellement uniforme**. Deux couleurs avec même `L` ont la même luminosité perçue — ce que `#RRGGBB` ne garantit **jamais**.

**Avantages concrets :**
1. **Échelles cohérentes** : une échelle de teintes avec chroma constante = vraie échelle perceptuelle (pas un zigzag).
2. **Dark mode propre** : désaturer en baissant `C` à luminosité égale donne un résultat correct.
3. **Mix correct** : `color-mix(in oklch, ...)` interpole dans l'espace perceptuel.
4. **Wider gamut** : atteint des couleurs P3 / Display-P3 que RGB sRGB ne peut pas représenter.

**Syntaxe CSS (support universel browsers 2024+) :**
```css
--brand: oklch(0.555 0.165 272.8);
--brand-hover: oklch(0.50 0.165 272.8);      /* même hue/chroma, moins lumineux */
--brand-muted: oklch(0.555 0.08 272.8);      /* même lum/hue, moins saturé */
--brand-p3: oklch(0.70 0.31 25);             /* couleurs hors sRGB gamut */
```

**Les valeurs :**
- `L` : 0 (noir) → 1 (blanc). Percevoir : 0.2 = très sombre, 0.5 = mid-gray, 0.9 = très clair.
- `C` : 0 (neutre gris) → ~0.4 (limite technique, mais ~0.15 suffit pour SaaS).
- `H` : 0–360° (angle). 0° rouge, 30° orange, 60° jaune, 120° vert, 180° cyan, 240° bleu, 300° magenta.

**Outils :**
- **oklch.com** (Evil Martians) — picker interactif.
- **huetone.ardov.me** — construire échelles par hue/chroma.
- **atmos.style** — palette builder.
- **Culori** (JS) — programmatique.

---

## II. Le système Stit'Claude — une architecture tokens

### Sémantique avant littéral

```css
/* ❌ NEVER — littéral */
.button { background: oklch(0.555 0.165 272.8); }

/* ✅ TOUJOURS — sémantique */
:root {
  --brand: oklch(0.555 0.165 272.8);
}
.button { background: var(--brand); }
```

### Palette Stit'Claude de base (à forker vers la house)

```css
:root {
  /* ============================================================
     BASE NEUTRAL — 12 steps, style Radix
     ============================================================ */
  --gray-1:  oklch(0.992 0.001 260);  /* app background */
  --gray-2:  oklch(0.977 0.002 260);  /* subtle bg (striped, code) */
  --gray-3:  oklch(0.946 0.003 260);  /* UI element bg */
  --gray-4:  oklch(0.916 0.004 260);  /* UI element bg hover */
  --gray-5:  oklch(0.879 0.005 260);  /* UI element bg active */
  --gray-6:  oklch(0.835 0.006 260);  /* subtle borders */
  --gray-7:  oklch(0.782 0.008 260);  /* UI borders */
  --gray-8:  oklch(0.695 0.011 260);  /* hovered UI borders */
  --gray-9:  oklch(0.558 0.014 260);  /* solid fills */
  --gray-10: oklch(0.497 0.013 260);  /* hovered solid */
  --gray-11: oklch(0.392 0.011 260);  /* low-contrast text */
  --gray-12: oklch(0.200 0.009 260);  /* high-contrast text */

  /* ============================================================
     BRAND ACCENT — ajuster selon house choisie
     ============================================================ */
  --brand-1:  oklch(0.990 0.004 270);
  --brand-2:  oklch(0.975 0.010 270);
  --brand-3:  oklch(0.945 0.030 270);
  --brand-4:  oklch(0.905 0.055 270);
  --brand-5:  oklch(0.860 0.085 270);
  --brand-6:  oklch(0.810 0.110 270);
  --brand-7:  oklch(0.745 0.135 270);
  --brand-8:  oklch(0.680 0.160 270);
  --brand-9:  oklch(0.555 0.165 270);  /* ← le brand core */
  --brand-10: oklch(0.500 0.170 270);
  --brand-11: oklch(0.450 0.160 270);
  --brand-12: oklch(0.270 0.100 270);

  /* ============================================================
     SÉMANTIQUE DE SURFACE
     ============================================================ */
  --bg:          var(--gray-1);
  --bg-subtle:   var(--gray-2);
  --card:        var(--gray-1);
  --popover:     var(--gray-1);

  --fg:          var(--gray-12);
  --fg-muted:    var(--gray-11);
  --fg-subtle:   var(--gray-10);

  --border:      var(--gray-6);
  --border-strong: var(--gray-7);

  --accent:      var(--brand-9);
  --accent-fg:   oklch(1 0 0);        /* texte sur fond accent */
  --accent-hover: var(--brand-10);

  --ring:        var(--brand-8);

  /* ============================================================
     ÉTATS MÉTIER (signal colors)
     ============================================================ */
  --success:     oklch(0.70 0.17 152);
  --warning:     oklch(0.78 0.16 85);
  --danger:      oklch(0.62 0.22 25);
  --info:        oklch(0.68 0.12 232);
}

/* ============================================================
   DARK MODE — peer, pas invert
   ============================================================ */

[data-theme="dark"], .dark {
  --gray-1:  oklch(0.145 0.005 260);
  --gray-2:  oklch(0.178 0.006 260);
  --gray-3:  oklch(0.213 0.007 260);
  --gray-4:  oklch(0.244 0.008 260);
  --gray-5:  oklch(0.275 0.009 260);
  --gray-6:  oklch(0.310 0.010 260);
  --gray-7:  oklch(0.359 0.012 260);
  --gray-8:  oklch(0.438 0.014 260);
  --gray-9:  oklch(0.546 0.014 260);
  --gray-10: oklch(0.602 0.014 260);
  --gray-11: oklch(0.724 0.010 260);
  --gray-12: oklch(0.923 0.003 260);

  /* Brand désaturé de ~15% en dark */
  --brand-9:  oklch(0.620 0.140 270);  /* ← vs 0.555 0.165 en light */
  --brand-10: oklch(0.680 0.135 270);

  /* Les tokens sémantiques se mettent à jour automatiquement via var() */
}
```

### Les règles derrière cette palette

1. **Hue stable** — tous les steps de `gray-*` ont `h: 260` (léger bias bleu, donne du caractère sans saturer). Même principe pour `brand-*` avec `h: 270`.
2. **Lightness perceptuelle** — les `L` sont espacés selon courbe perceptuelle (pas linéaire).
3. **Chroma progresse** — steps 1-5 très désaturés, steps 8-10 pleine saturation, steps 11-12 baissent le chroma pour texte lisible.
4. **Dark mode desaturé** — brand passe de `C: 0.165` à `C: 0.140` (−15%), pour éviter la vibration sur fond sombre.
5. **Signal colors** réservées — `--success`, `--warning`, `--danger`, `--info` ne servent **que** aux états métier.

---

## III. Radix 12-step — les rôles canoniques

Chaque step a un **rôle** précis. À respecter strictement :

| Step | Rôle | Exemple d'usage |
|---|---|---|
| 1 | App background | `body { background: var(--gray-1); }` |
| 2 | Subtle background | Zebra stripes, code blocks, cards contrastantes |
| 3 | UI element background | Bouton idle, input idle |
| 4 | UI element background hover | Bouton hover |
| 5 | UI element background active | Bouton pressed, row sélectionnée |
| 6 | Subtle borders | Séparateurs de lignes |
| 7 | UI element borders | Bordure input, bordure carte |
| 8 | Hovered UI borders, Focus ring | Bordure input:hover, focus ring |
| 9 | Solid backgrounds | Bouton solide (accent) |
| 10 | Hovered solid | Bouton hover |
| 11 | Low-contrast text | Texte secondaire, icône de label |
| 12 | High-contrast text | Texte principal, titres |

**Conséquence :** jamais écrire `background: var(--gray-5)` pour un bouton idle. C'est `--gray-3`. Le rôle compte autant que la couleur.

---

## IV. color-mix() — l'interpolation moderne

```css
/* Hover : mix de brand avec noir, dans OKLCH */
--brand-hover: color-mix(in oklch, var(--brand) 85%, black);

/* Surface teintée : accent dilué dans le bg */
--surface-tinted: color-mix(in oklch, var(--brand) 8%, var(--bg));

/* Transparence propre */
--brand-50: color-mix(in oklch, var(--brand) 50%, transparent);

/* Mix entre deux tokens */
--gradient-from: color-mix(in oklch, var(--brand) 90%, var(--danger) 10%);
```

**Puissance réelle :** un seul brand token → toutes les variantes dérivées. Change le brand, tout suit.

---

## V. Dark mode — les commandements

### 1. Jamais pur `#000`

`oklch(0 0 0)` (pur noir) fatigue l'œil, les accents saturés vibrent dessus. Utilise :
- `oklch(0.14 0 0)` — noir doux neutre
- `oklch(0.17 0.01 260)` — noir avec bias teinte (signature)
- `oklch(0.20 0.01 260)` — Linear-like `#222326`

### 2. Jamais pur `#FFF` en texte

`oklch(1 0 0)` crée trop de contraste sur fond sombre. Utilise :
- `oklch(0.96 0 0)` — blanc doux
- `rgba(255,255,255,0.87)` — Material 3 high-emphasis
- `rgba(255,255,255,0.60)` — Material 3 medium-emphasis

### 3. Désature les accents

Brand en light : `oklch(0.555 0.165 270)`.
Brand en dark : `oklch(0.620 0.140 270)` (−15% chroma, +10% lum).

### 4. Élévation par **tint**, pas par ombre

En dark, les cartes flottantes ne gagnent **pas** d'ombre (invisible). Elles gagnent en luminosité :
- Surface : `gray-2`
- Carte level 1 : `gray-3`
- Popover / modal : `gray-4`

### 5. Tester les deux modes

Chaque screen Stit'Claude a **deux versions** vérifiées. Le dark n'est pas un "nice to have".

---

## VI. APCA et WCAG — contraste comme métier

### WCAG 2.1 (norme légale actuelle)

- **4.5:1** contrast ratio pour corps de texte (AA).
- **3:1** pour texte large (≥18pt, ou ≥14pt bold).
- **3:1** pour UI components (boutons, inputs, icônes).
- **7:1** niveau AAA (premium).

**Problème :** le calcul `(L1 + 0.05) / (L2 + 0.05)` est basé sur une pondération RGB obsolète. Rend mal sur certaines couleurs (jaunes, oranges).

### APCA (Advanced Perceptual Contrast Algorithm)

Candidat pour WCAG 3 (non normatif en 2026, mais déjà utilisé par Adobe, Penpot, Figma).

**Unité : Lc (Lightness contrast).** Plage théorique −108 à +106.

**Seuils pratiques :**
- **Lc 90+** : idéal pour texte petit.
- **Lc 75** : plancher pour body text (~16–18px).
- **Lc 60** : plancher pour texte large / headlines.
- **Lc 45** : éléments non textuels (icônes, bordures fortes).
- **Lc 30** : bordures subtiles, décoratif.

**Outils :**
- **apcacontrast.com** — calculateur officiel.
- **Figma plugin APCA Contrast**.
- **Raycast extension** pour vérif rapide.

### Règle Stit'Claude

Vérifier **APCA Lc ≥ 75 body** et **WCAG 4.5:1** comme planchers simultanés. Si l'un échoue, remonte.

---

## VII. Palettes signature — quand choisir quoi

### La palette "Linear-like"
Un seul accent désaturé (indigo, teal, ou rouge signal), échelle neutre froide. Brand `oklch(0.555 0.165 270)` (indigo) ou `oklch(0.68 0.12 185)` (teal).
Usage : SaaS B2B sérieux, outils pros.

### La palette "Stripe blurple"
Brand saturé `oklch(0.595 0.235 275)`, navy `oklch(0.245 0.08 250)`, neutral chaud.
Usage : tech haut de gamme, documentation premium.

### La palette "Vercel pure"
Pas d'accent — juste noir, blanc, et signal red/blue pour états.
Usage : outils dev, brutalist minimal.

### La palette "Notion warm"
Cream `oklch(0.968 0.005 80)`, warm near-black `oklch(0.245 0.01 40)`. 10 tints ultra-muted pour highlights.
Usage : outils document, knowledge management, warmth.

### La palette "Industrial-Pro"
Neutre froid dominant, un seul accent profond (IBM blue `oklch(0.47 0.20 255)` ou teal `oklch(0.55 0.15 195)`). Signal colors stricts réservés aux états métier.
Usage : logiciels scientifiques, metiers lourds, rapports.

### La palette "Japanese-Ma"
Un blanc dominant (`oklch(0.98 0.002 80)` cream ou `oklch(0.99 0 0)` neutre), un noir unique (`oklch(0.15 0 0)`), une couleur timide (rouge MUJI `oklch(0.55 0.18 30)` à petite dose).
Usage : portfolios, luxe discret, écriture.

### La palette "Arc-like"
Deep quasi-noir chrome, palette signature **par user** (gradients mood). Pas de brand fixe.
Usage : outils avec customisation user-driven.

---

## VIII. Dégradés — quand et comment

### Les 3 règles

1. **Hues proches** (≤30° d'écart en OKLCH) pour dégradés propres. Jamais red→green (crosses neutral).
2. **Interpolation OKLCH** (2024+ : `linear-gradient(in oklch, ...)`).
3. **Motivé**, pas décoratif. Un dégradé doit représenter quelque chose (tonalité, intensité, temps).

```css
/* Dégradé tonal : même hue, luminosité variable */
.hero {
  background: linear-gradient(
    in oklch to bottom,
    oklch(0.95 0.08 260),
    oklch(0.88 0.12 260)
  );
}

/* Dégradé hue proche (±30°) */
.glow {
  background: linear-gradient(
    in oklch to right,
    oklch(0.60 0.18 275),   /* indigo */
    oklch(0.60 0.18 245)    /* bleu proche */
  );
}

/* ❌ À éviter : hue opposés */
/* background: linear-gradient(in oklch, red, cyan); */
```

### Mesh gradients

Si tu fais un mesh (Stripe-like), **dessine-le à la main** dans la house (même hue famille), **n'utilise pas** de générateur.

---

## IX. Color modes avancés

### Forced colors (Windows High Contrast)

```css
@media (forced-colors: active) {
  .button {
    border: 1px solid ButtonText;  /* utilise couleurs système */
    background: ButtonFace;
    color: ButtonText;
  }
  .button:focus-visible {
    outline: 2px solid Highlight;
  }
}
```

### prefers-color-scheme

```css
:root { color-scheme: light dark; }

@media (prefers-color-scheme: dark) {
  :root { /* dark tokens */ }
}
```

### color-gamut (P3)

```css
@media (color-gamut: p3) {
  :root {
    --brand: oklch(0.70 0.31 25);  /* couleurs P3 plus vives */
  }
}
```

---

## X. La règle finale

**Un seul accent. Une échelle neutre. Des signals réservés. Des tokens sémantiques.**

Si ton design nécessite 5 couleurs brand pour "s'exprimer", c'est qu'il manque de confiance. Stit'Claude fait tout avec **1 accent + 12 steps neutres + 4 signals**. C'est largement suffisant pour Linear, pour Stripe, pour Apple. C'est suffisant pour toi.
