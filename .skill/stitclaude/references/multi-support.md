# references/multi-support.md — Le playbook multi-support

> *Charge ce fichier quand le projet cible un medium spécifique. Chaque section donne les contraintes non-négociables et les règles de craft propres au support.*

Stit'Claude est **full-support**. Un designer qui ne sait faire que du web React est un demi-designer.

---

## 1. Web marketing / landing / blog

**Métriques non-négociables (Core Web Vitals 2026) :**
- **LCP** (Largest Contentful Paint) < 2.5s
- **INP** (Interaction to Next Paint) < 200ms (remplace FID depuis 2024)
- **CLS** (Cumulative Layout Shift) < 0.1

**Stratégie fonts :**
- Self-host WOFF2 (pas Google Fonts CDN — le coût TTFB n'en vaut plus la peine depuis 2024).
- `<link rel="preload" as="font" type="font/woff2" crossorigin>` pour la police above-fold.
- `font-display: optional` sur headline critique (évite CLS), `swap` sur body.

**Images :**
- `<img>` avec `width`, `height`, `loading="lazy"`, `decoding="async"`.
- AVIF d'abord, WebP fallback, JPG ultime.
- `srcset` + `sizes` systématique.

**Structure :** HTML5 sémantique (`<main>`, `<article>`, `<nav>`, `<header>`, `<footer>`). Open Graph + Twitter Card + JSON-LD Schema.org.

**Progressive enhancement :** le contenu doit être lisible **sans JS**. La motion et les interactions sont des couches.

**Mobile-first** mais design pour 1440w en desktop primary quand cible = knowledge workers (la plupart sont sur laptop au bureau).

---

## 2. SaaS / web apps / dashboards

**Densité > whitespace.** Un user pro passe 6h/jour dans l'outil — il veut voir un maximum d'information par écran.

**Patterns universels :**
- **Cmd-K command palette** (obligatoire au-delà de 20 écrans).
- **? pour shortcuts sheet.**
- **Esc pour fermer** (modals, menus, overlays).
- **Tab entre zones logiques**, arrow keys dans les tableaux.

**Layout standard :**
```
┌──────────────────────────────────────────────┐
│ Top bar (56–64px): logo, search, user menu   │
├────────┬─────────────────────────┬───────────┤
│        │                         │           │
│ Left   │ Main content            │ Right     │
│ nav    │ (tables, forms, charts) │ inspector │
│ 240px  │                         │ 320px     │
│        │                         │ optional  │
└────────┴─────────────────────────┴───────────┘
```

**Dark mode comme pair :** un vrai SaaS pro a un dark mode **pensé**. Voir `color.md`.

**Data visualisation — hiérarchie perceptive de Cleveland-McGill (ordre d'efficacité décroissante) :**
1. Position sur axe commun (scatter, bar chart)
2. Longueur non alignée (column)
3. Direction / angle (slope)
4. Aire (bubble)
5. Volume (3D — à éviter)
6. Couleur (nuance, saturation)

**Nombres :** `font-variant-numeric: tabular-nums` systématique. Monospace pour tableaux denses.

---

## 3. Industrial / scientific / pro software

**Lignée à respecter :** Bloomberg Terminal (amber on black, tabular, densité comme feature), LabVIEW (block-diagram programming), MATLAB/Simulink, Ansys, AutoCAD, SolidWorks, Siemens TIA Portal.

**Règles métier :**
- **Unités toujours visibles.** Jamais `450` seul → toujours `450 h` ou `1.2·10⁻³ /h`.
- **Précision indicateur.** Une valeur SIL 2 a un range PFH — affiche les bornes, pas juste la valeur ponctuelle.
- **Tabular numbers** obligatoires sur toute donnée. Monospace pour les tableaux de calculs.
- **Reduced chrome** — la donnée **est** l'UI. Pas de gradient, pas de drop shadow, bordures hairline seulement.
- **Row heights :** 28–32px. Corps 12–13px, secondaire 11px. Zebra stripes seulement si >15 rows.
- **Keyboard-first** — Tab entre champs, arrow keys dans tableaux, Enter commit, Esc cancel.
- **Print-ready** — chaque écran doit survivre à `Cmd+P` en PDF propre.
- **Error states signifiants** — une violation SIL ne doit **pas** ressembler à une notification Twitter.
- **Deux polices max :** grotesque neutre pour UI (Inter, IBM Plex Sans, Söhne) + mono pour data (JetBrains Mono, IBM Plex Mono, Berkeley Mono).
- **Signal color discipline :** green/amber/red **réservées** aux états de sécurité ou métier. Jamais en décoration.
- **Traçabilité** — chaque valeur affiche sa source (tooltip = formule, input, ou mesure).

**Use cases typiques :** outils SIL/SIF, DCS/PLC supervisors, CAO, CFD/FEA, LIMS, ELN, MES, logiciels scientifiques.

---

## 4. iOS / iPadOS / macOS / watchOS / tvOS / visionOS 26+

**WWDC 2025 :** Apple a unifié les versions de ses OS à "26" (iOS 26, macOS Tahoe 26, watchOS 26, tvOS 26, visionOS 26, iPadOS 26). Claude doit utiliser cette version actuelle, **pas** "iOS 19" ou équivalent.

**Liquid Glass** (Alan Dye, juin 2025) : matériau digital qui bends and shapes light, avec lensing, specular highlights, adaptive tint. **Apple recommande la retenue** — ne pas l'appliquer partout. À réserver aux surfaces flottantes et overlays.

**Règles universelles Apple :**
- **SF Pro / SF Pro Display / SF Mono / SF Rounded** selon contexte.
- **SF Symbols 7** — 7500+ glyphes, variable multicolor, animations.
- **Dynamic Type** — l'user choisit sa taille, ton app s'adapte.
- **Squircle concentrique partout** — `concentricShape` dans SwiftUI, `corner-shape: squircle` dans CSS 2026.
- **Safe areas** — jamais sous Dynamic Island, respect des notches.
- **Haptics** — light pour sélection, medium pour confirmation, heavy pour erreur.

**macOS spécifique :**
- **Menu bar est contrat d'accessibilité** — chaque commande **doit** être dans la menu bar.
- Shortcuts standards : ⌘W close window, ⌘Q quit, ⌘N new, ⌘, preferences, ⌘⇧P command palette custom.
- Window restoration au relaunch.
- Sheets pour modals app-locked, popovers pour contextual.
- AppKit pour apps pro matures, SwiftUI pour nouveaux projets.

**iPadOS :**
- Stage Manager + Split View + Slide Over.
- Support pointer, support Apple Pencil, support keyboard full.
- External display = full extended display depuis iPadOS 17+.

**watchOS :**
- Complications design = craft à part (glanceable <2s, <50 chars).
- Smart Stack depuis watchOS 11.
- Corner masks circulaires.

**tvOS :**
- D-pad focus engine (parallax auto au focus).
- Min type 32pt.
- 3 niveaux de hiérarchie max.

**visionOS :**
- Glass panels default.
- Eye tracking + pinch = primary input.
- Spatial audio matters.
- Immersive scenes vs windowed apps — distinction UX critique.

---

## 5. Android / Material 3 (Material You)

**Dynamic Color :** palette générée depuis le wallpaper, 13 tones. L'app **doit** s'adapter au thème user.

**Typography (15 rôles baseline + 15 emphasized) :**
Display (Large 57 / Medium 45 / Small 36), Headline (32/28/24), Title (22/16/14), Body (16/14/12), Label (14/12/11).

**Surface elevation via tonal** (pas d'ombre) :
- Level 0 (surface) : 0% tint
- Level 1 : +5% tint
- Level 2 : +8% tint
- Level 3 : +11% tint
- Level 4 : +12% tint
- Level 5 : +14% tint

**Shape scale (10 steps) :** None (0), Extra-Small (4), Small (8), Medium (12), Large (16), Large-Increased (20), Extra-Large (28), Extra-Large-Increased (32), Extra-Extra-Large (48), Full (50%).

**Navigation :**
- **Bottom nav** pour 3–5 top-level destinations (phones).
- **Nav rail** pour tablets/foldables (80dp large).
- **Nav drawer** pour >5 destinations ou profondeur.

**Predictive back** (Android 14+) : animation back-preview au swipe.

**Edge-to-edge** par défaut (Android 15+ force ce pattern).

**Jetpack Compose** = canonical. XML layouts = maintenance uniquement.

---

## 6. Windows 11/12 / Fluent 2

**Matériaux :**
- **Mica** : opaque, sampled wallpaper, performance-cheap, pour **surfaces long-life** (window backgrounds).
- **Mica Alt** : tint plus marqué, pour **tabbed title bars**.
- **Acrylic** : flou live translucide, **transient uniquement** (flyouts, context menus, fly-in panels).
- **Smoke** : dim modal overlay.
- **Reveal light** : RETIRÉ depuis WinUI 2.6. Ne plus utiliser.

**Font :** Segoe UI Variable (variable font, axis `wght` + `opsz`).

**Corner radius :** 4px standard, 8px pour surfaces flottantes, 0 pour windows.

**Context menu** = right-click **partout**. Shortcut shown.

**Multi-monitor DPI awareness** obligatoire (WinUI 3 gère automatiquement).

**Stack :** WinUI 3 pour nouveau, Win32/WPF pour legacy, Electron pour multi-OS (mais alors adapter au système hôte).

---

## 7. Linux / GNOME / KDE

**GNOME :** libadwaita depuis GNOME 42+. **Ne jamais mettre de chrome custom** — utiliser `GtkHeaderBar` + `AdwApplicationWindow`. Respect de Adwaita HIG : primary/secondary actions clairement séparés, pas de custom styling hors thème.

**KDE :** Breeze icon theme, Qt6. Plus de latitude stylistique que GNOME.

**Libraries :** GTK4 (GNOME), Qt6 (KDE), ou Electron (portabilité).

---

## 8. TV / 10-foot UI (Google TV, Apple TV, Fire TV)

- **D-pad focus** = primary input. Jamais de pointer-first sur TV.
- **Focus engine** — tvOS fait le parallax auto ; sur Android TV, implémenter manuellement.
- **Min type 32pt** corps, 48pt+ headlines.
- **3 niveaux max** de hiérarchie.
- **Safe zones** — 5% inset sur tous les bords (overscan TV).

---

## 9. Wearables (Apple Watch, Wear OS)

**Contraintes :**
- **Glanceable <2s** — si ça prend plus de 2 secondes à comprendre, c'est raté.
- **<50 caractères** par écran utile.
- **Circular corner masks** (Apple Watch depuis le premier, Wear OS 3+).

**Complications (watchOS) :**
- Circular Small : 1 info, 1 chiffre ou 1 glyphe.
- Modular Large : jusqu'à 4 lignes, mais chacune essentielle.
- Graphic Corner : 1 info + indicateur circulaire.

**Smart Stack / Tiles** (watchOS 11+, Wear OS 4+) : glanceable widgets empilés verticalement.

---

## 10. Terminal / CLI

**Stack Charm.sh (Go) :**
- **Bubble Tea** — framework TUI Elm-architecture.
- **Lip Gloss** — styling (borders, padding, colors).
- **Bubbles** — composants (list, text input, spinner, viewport).
- **Gum** — shell scripts avec UI riche.
- **Glow** — markdown viewer.
- **VHS** — enregistreur terminal.

**Terminaux :**
- **Warp** (Rust, AI-powered, command blocks).
- **Ghostty** (Mitchell Hashimoto, GPU-accelerated, minimal config, open-source 2024).
- **WezTerm** (Rust, Lua config, power user).
- **Alacritty** (minimal, rapide).

**Palettes (les 7 essentielles 2026) :**
- **Catppuccin** (Latte/Frappé/Macchiato/Mocha) — la défaut montante.
- **Tokyo Night** — deep navy + cyan.
- **Dracula** — purple + pink.
- **Nord** — cool Nordic grays.
- **Solarized** (Ethan Schoonover) — science-grounded.
- **Gruvbox** — warm retro.
- **Everforest** — green-leaning.

**Règle Stit'Claude :** respecter la palette terminal user — **ne pas** forcer des couleurs hardcodées. Utiliser les ANSI 16 (black, red, green, yellow, blue, magenta, cyan, white + bright variants).

---

## 11. Email HTML

**Réalités brutales :**
- **Tables** pour layout (Outlook ne rend pas correctement flex/grid).
- **Inline styles** (beaucoup de clients strippent `<style>`).
- **<style> ignoré par Gmail** en web dans certains modes.
- **Dark mode :** Apple Mail supporte `prefers-color-scheme`, Gmail fait invert auto (souvent cassé), Outlook ignore.

**Frameworks :**
- **MJML** (standard open-source, compile en HTML cross-client).
- **React Email** (Resend, JSX → HTML).
- **Maizzle** (Tailwind-based).

**Testing :** Litmus, Email on Acid — obligatoires pour tout mailing >1000 destinataires.

**Rules :**
- Largeur 600–640px maximum (container).
- Images avec `alt` (les 40%+ users qui bloquent images les voient en alt).
- CTA buttons en tables (pas `<button>`).
- Polices : system stack + fallback. Pas de WOFF2 (pas supporté partout).

---

## 12. Print / PDF — voir `print-pdf.md`

Medium majeur et souvent sous-estimé. Fichier dédié compte tenu de son importance (notamment pour les rapports techniques que Yoann produit).

---

## 13. Signage / wayfinding

Hors digital mais craft Stit'Claude :
- Pictogrammes Aicher (JO Munich 1972) = référence.
- Contraste APCA Lc 90+ à distance.
- Flèches directionnelles : épaisseur 1/5 de la hauteur, angle 45° ou 90° strict.
- Typographies lisibles à 30m : DIN, Frutiger, Clearview (US highway), Transport (UK).

---

## Règle Stit'Claude multi-support

**Chaque support a ses idiomes.** Un designer qui met du shadcn dans une app iOS native est aussi naïf qu'un designer qui met du SwiftUI dans un navigateur.

**Respecte l'OS hôte d'abord**, exprime ta signature ensuite — dans les détails (tokens, motion, densité, iconographie custom).
