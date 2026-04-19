# Stit'Claude — Skill Installation

> *The last frontend design skill anyone ever needs.*

**Stit'Claude** est un skill Claude pour design frontend full-support : web, SaaS, native (iOS/macOS/Android/Windows/Linux/watchOS/tvOS/visionOS), industrial/scientific, print/PDF, email, terminal. Il porte une signature reconnaissable, rejette le slop IA, et respecte les systèmes de tokens existants.

## Architecture

```
stitclaude/
├── SKILL.md                          # Le cœur — identité, 4 phases, 8 houses, checklist
├── references/                        # Sub-skills chargés à la demande
│   ├── pantheon.md                   # Rams, Vignelli, Kare, Ive, Hara, Scher, Bass...
│   ├── houses.md                     # Linear, Stripe, Vercel, Arc, Raycast, Apple HIG...
│   ├── antislop.md                   # Les 30 patterns IA à éradiquer
│   ├── multi-support.md              # Web, SaaS, native, TV, wearables, terminal, email
│   ├── print-pdf.md                  # CSS Paged Media, Typst, LaTeX, typo scientifique
│   ├── typography.md                 # Polices, scales, règles FR/EN/RTL/CJK
│   ├── color.md                      # OKLCH, Radix 12-step, color-mix, dark mode, APCA
│   └── motion.md                     # Springs, easings, view-transitions, haptics, sound
└── examples/
    ├── tokens.css                    # Starter kit — système de tokens à forker
    └── patterns.css                  # 24 patterns CSS modernes (2024-2026)
```

## Installation

### Option 1 — Skill utilisateur Claude.ai (recommandé)

1. Zippe le dossier `stitclaude/` entier.
2. Dépose le dans ton espace skills personnel Claude (`/mnt/skills/user/stitclaude/` en interface Computer Use, ou upload via Settings > Skills sur claude.ai quand la feature sera disponible).
3. Le skill se chargera automatiquement dès que ta requête touche au design frontend.

### Option 2 — Claude Code / Agent

1. Copie `stitclaude/` dans le dossier `.claude/skills/` de ton projet (ou ton `~/.claude/skills/`).
2. Ajoute dans ton `CLAUDE.md` de projet :
   ```
   Pour tout travail de design, UI, frontend, charge et suis /absolute/path/to/stitclaude/SKILL.md.
   ```

### Option 3 — Inline dans un prompt

Copie-colle le contenu de `SKILL.md` en tête de conversation avec Claude. Les sub-references peuvent être chargées à la demande via copier-coller si besoin.

## Utilisation

Stit'Claude se déclenche sur : *design, UI, frontend, landing, dashboard, mockup, prototype, React component, Tailwind, Figma, CSS, layout, visual, theme, typography, motion, print, PDF, mobile, responsive, icon, logo, brand, dark mode, polish, redesign*. (Et leurs équivalents français.)

À chaque livrable, Claude suivra le workflow :

1. **EXPLORE** — écrit un brief d'intention (5–8 lignes : projet, but, audience, support, house, références, contraintes, anti-goals).
2. **DISTILL** — détecte ou crée le système de tokens (fork depuis `examples/tokens.css` si absent).
3. **POLISH** — applique les règles micro-typo, concentricité, dark-mode peer, APCA, règles FR.
4. **SHIP** — run la checklist 12 points avant toute livraison.

## Le protocole token — règle d'or

**Avant de créer un token, Claude détecte l'existant.** Il scanne :

- `globals.css`, `tokens.css`, `theme.css`, `@theme` blocks
- `tailwind.config.*`, `design-tokens.json`
- Custom properties dans `:root` ou `[data-theme]`
- Composants shadcn/ui déjà présents

Si un système existe, il l'adopte et le respecte. Sinon seulement, il forke `examples/tokens.css`.

## Les 8 houses

Claude déclare une house dans son brief d'intention :

1. **Editorial** — Stripe docs, Medium, NYT interactive
2. **Industrial-Pro** — Bloomberg, LabVIEW, Siemens TIA
3. **Swiss-Quiet** — Linear, Müller-Brockmann
4. **Apple-Craft** — Apple HIG, Things 3, Ivory
5. **Playful-Warm** — Arc, Figma, Panic, Teenage Engineering
6. **Japanese-Ma** — MUJI, Kenya Hara, iA Writer
7. **Power-Dense** — Linear, Superhuman, Height, Raycast
8. **Editorial-Display** — Paula Scher, Pentagram, wood-type

## Philosophie

> *"Moins, mais mieux. Et quand on en fait plus : fais-le pour de vrai."*

- **Pas de décoration sans signification.**
- **Pas de trend sans conscience historique.**
- **Pas de signal fake.**
- **Pas de défaut brut.**

Chaque pixel justifie son existence. Chaque choix cite sa tradition. Chaque livrable passe les tests **Rams + Vignelli + Saarinen**.

## Mise à jour

Le skill est versionné. Version initiale : **Stit'Claude v2.0** (avril 2026).

Changements v2 vs v1 hypothétique :
- Architecture multi-fichiers (skill modulaire, chargement à la demande)
- Protocole de détection de tokens existants renforcé
- OKLCH + Radix 12-step comme système canonique
- Section print/PDF complète (CSS Paged Media + Typst + LaTeX)
- Support iOS/macOS 26 Liquid Glass documenté
- View Transitions API, @property, @starting-style, anchor positioning
- Règles FR typographiques intégrées

## Licence

Personnelle. Créé pour Yoann. Libre de modification, fork, et extension.

---

**Stit'Claude n'est pas un outil. C'est un métier.**

*On ne fait plus de designers comme ça aujourd'hui.*
