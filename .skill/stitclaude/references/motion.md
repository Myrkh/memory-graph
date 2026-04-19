# references/motion.md — Le mouvement comme craft

> *Charge ce fichier quand tu animes un composant, une transition de page, un dashboard interactif, ou quand tu définis les tokens motion d'un système.*

Le motion est le différenciateur final entre un produit qui se sent **vivant** et un produit qui se sent **inerte**. Mais le mauvais motion est pire que pas de motion.

**Le principe Rauno Freiberg :** *"There must be a reason."* Chaque animation justifie son existence par une aide à la compréhension ou un retour utilisateur.

---

## I. Springs vs Easings — quand utiliser quoi

### Spring physics

**Utiliser quand :** état qui change avec vélocité — drag-release, toggle, swipe, throw.
**Raison :** le mouvement naturel a de l'inertie. Un swipe doit ressentir que l'user l'a "lancé".

**Paramètres :**
- `stiffness` : élasticité du ressort. Plus haut = snap rapide. Défaut 170–400.
- `damping` : résistance au mouvement. Plus haut = moins de rebond. Défaut 20–30.
- `mass` : inertie. Plus haut = mouvement plus lent. Défaut 1.

### Easings (cubic-bezier)

**Utiliser quand :** entrée/sortie scriptée, durée fixe connue, séquences chorégraphiées.
**Raison :** un fade-in de 250ms n'a pas de physique — il a une courbe.

---

## II. Les easings nommés Stit'Claude

**Tokens CSS à réutiliser systématiquement :**

```css
:root {
  /* ==========================================
     DURATIONS (inspirées Material 3)
     ========================================== */
  --duration-instant:    50ms;    /* tap feedback, micro hover */
  --duration-fast:       120ms;   /* scale click, focus ring */
  --duration-normal:     200ms;   /* défaut UI — Linear target */
  --duration-moderate:   300ms;   /* défaut panel, dropdown */
  --duration-slow:       500ms;   /* sheet, modal entrance */
  --duration-long:       800ms;   /* page transition, narrative */

  /* ==========================================
     EASINGS (nommés, réutilisés)
     ========================================== */

  /* Linéaire — rare, pour gauges ou progression continue */
  --ease-linear: linear;

  /* Standard — Material 3, équivalent iOS default */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);

  /* Emphasized — Material 3 preferred, la plus utilisée */
  --ease-emphasized: cubic-bezier(0.2, 0, 0, 1);

  /* Emphasized decelerate — pour entrées */
  --ease-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);

  /* Emphasized accelerate — pour sorties */
  --ease-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);

  /* Expo out — entrée dramatique */
  --ease-expo-out: cubic-bezier(0.16, 1, 0.3, 1);

  /* IBM Carbon productive */
  --ease-productive: cubic-bezier(0.2, 0, 0.38, 0.9);

  /* IBM Carbon expressive */
  --ease-expressive: cubic-bezier(0.4, 0.14, 0.3, 1);

  /* Spring-like (pas vrai spring mais imite l'overshoot) */
  --ease-bounce: cubic-bezier(0.5, 1.5, 0.5, 1);
}
```

### Règles d'usage

- **Entrée de contenu** (fade-in, slide-in) : `--ease-decelerate` ou `--ease-expo-out`.
- **Sortie de contenu** (dismiss) : `--ease-accelerate`.
- **Hover / focus feedback** : `--ease-standard` + `--duration-fast`.
- **Modal / sheet open** : `--ease-emphasized` + `--duration-moderate/slow`.
- **Page transition** : `--ease-emphasized` + `--duration-slow`.
- **Micro-interaction** (button press) : `--ease-standard` + `--duration-instant/fast`.

### Règle d'or Stit'Claude

**≤300ms par défaut.** Au-delà, l'user attend. Seul le narrative moment (modal d'onboarding, hero transition) peut aller à 500–800ms.

---

## III. SwiftUI springs — la référence iOS

**Apple a codifié 3 springs nommés (iOS/macOS 17+) :**

```swift
.animation(.smooth, value: state)    // response 0.5, damping 1.0  (no bounce)
.animation(.snappy, value: state)    // response 0.3, damping 0.85 (léger bounce)
.animation(.bouncy, value: state)    // response 0.5, damping 0.7  (rebond prononcé)
```

**Motion JS equivalent :**

```js
import { motion } from "motion/react";

// Smooth (no bounce)
<motion.div animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 30 }} />

// Snappy (slight bounce)
<motion.div animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 28 }} />

// Bouncy
<motion.div animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} />
```

**Motion défauts :** `stiffness: 170`, `damping: 26`, `mass: 1`.

---

## IV. Apple Fluid Interface principles (WWDC 2018, Chan Karunamuni)

Les 6 principes qui distinguent iOS du reste :

### 1. Detachment — détachement sans friction

Au début d'un geste, l'objet se détache **sans hésitation** de son origine. Aucune inertie initiale visible.

### 2. Physics-driven — physique héritée

La vélocité de la fin du geste utilisateur **alimente** l'animation de sortie. Si tu swipes fort une notification, elle part fort. Doucement, elle glisse lentement.

### 3. Interruptibility — interruptible à tout moment

On peut saisir une animation en cours et l'inverser. Jamais "attendre la fin" pour l'user.

### 4. Rubber-banding — résistance aux bornes

Aux limites (fin de scroll, drag hors zone), le mouvement ne stoppe pas brutalement — il résiste progressivement.

### 5. Acceleration matching — synchrone avec le doigt

L'interface accélère en phase avec le doigt, pas en décalé.

### 6. Direct manipulation — ce qu'on touche bouge

La chose qu'on touche **est** la chose qui bouge. Pas de proxy, pas d'indirection.

**Applicable au-delà d'iOS :** ces principes font la différence entre un drag-and-drop élégant et un drag-and-drop frustrant, partout.

---

## V. View Transitions API — le futur du motion cross-page

**Support :** Chrome 111+ (same-document 2023), Safari 18+, Firefox 135+ (2025). Cross-document transitions Chrome 126+ (2024).

### Same-document (SPA)

```js
document.startViewTransition(() => {
  // Ton update DOM
  updateContent();
});
```

```css
/* Animation par défaut (cross-fade) */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 300ms;
  animation-timing-function: var(--ease-emphasized);
}

/* Transition nommée pour un élément précis */
.hero-image {
  view-transition-name: hero-image;
}

::view-transition-group(hero-image) {
  animation-duration: 500ms;
  animation-timing-function: var(--ease-expo-out);
}
```

### Cross-document (MPA depuis 2024)

```css
@view-transition {
  navigation: auto;
}
```

**Use case :** même un site en HTML pur statique peut avoir des transitions fluides entre pages. Révolution.

---

## VI. Scroll-driven animations — 2024+

**Support :** Chrome 115+, Safari Tech Preview, Firefox polyfill.

```css
@keyframes fade-in-up {
  from { opacity: 0; translate: 0 1rem; }
  to   { opacity: 1; translate: 0; }
}

.reveal {
  animation: fade-in-up linear both;
  animation-timeline: view();
  animation-range: entry 10% cover 30%;
}
```

**Deux timelines :**
- `view()` — basée sur la visibilité de l'élément dans le viewport.
- `scroll()` — basée sur la position de scroll du container.

**Règle :** utiliser avec **parcimonie**. Pas chaque section qui fade-in. Réserve pour moments clés.

---

## VII. @property — gradients animables et plus

Avant `@property`, on ne pouvait pas animer `background: linear-gradient(...)` car les gradients n'étaient pas interpolables. Maintenant :

```css
@property --hue {
  syntax: "<angle>";
  inherits: false;
  initial-value: 250deg;
}

.hero {
  background: linear-gradient(
    var(--hue),
    oklch(0.6 0.2 0),
    oklch(0.6 0.2 180)
  );
  transition: --hue var(--duration-slow) var(--ease-emphasized);
}

.hero:hover {
  --hue: 310deg;
}
```

**Autre usage :** animable gradient stops, transform origins, custom props typés.

---

## VIII. @starting-style — enter animations sans JS

**Support :** Chrome 117+, Safari 17.5+, Firefox 129+.

```css
.modal {
  opacity: 1;
  transform: scale(1);
  transition: opacity 200ms, transform 200ms;

  @starting-style {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Quand .modal est ajouté au DOM, il anime depuis les valeurs @starting-style */
```

Permet enter/exit animations **sans JS**, pour modals, toasts, popovers.

---

## IX. Popover API + `<dialog>` + transitions

```html
<button popovertarget="menu">Menu</button>
<div popover id="menu" class="menu">…</div>

<dialog id="modal">
  <form method="dialog">…</form>
</dialog>
```

```css
.menu {
  opacity: 0;
  transform: translateY(-8px);
  transition:
    opacity var(--duration-normal) var(--ease-standard),
    transform var(--duration-normal) var(--ease-standard),
    display var(--duration-normal) allow-discrete,
    overlay var(--duration-normal) allow-discrete;
}

.menu:popover-open {
  opacity: 1;
  transform: translateY(0);
}

@starting-style {
  .menu:popover-open {
    opacity: 0;
    transform: translateY(-8px);
  }
}
```

---

## X. prefers-reduced-motion — obligatoire

**Toujours une branche pour reduced motion.** L'user a des raisons physiques (vestibulaires, migraines, TDAH) de désactiver les animations.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Mais on peut garder des "feedback essentiels" */
  .focus-ring {
    transition: outline-offset 150ms linear !important;
  }
}
```

**En Framer Motion / Motion :**

```js
import { useReducedMotion } from "motion/react";

function Card() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      animate={{ opacity: 1 }}
      transition={reduce ? { duration: 0 } : { type: "spring" }}
    />
  );
}
```

---

## XI. Haptics — la couche tactile

### iOS / Apple Taptic Engine

**3 familles de feedback :**

- **Notification** : `success` / `warning` / `error`. Pour fins d'action (form submit réussi, erreur de validation).
- **Impact** : `light` / `medium` / `heavy` / `soft` / `rigid`. Pour "contacts" virtuels (toggle, pick).
- **Selection** : "tick" simple. Pour pickers, sliders discrets.

**En SwiftUI :**

```swift
import UIKit

UINotificationFeedbackGenerator().notificationOccurred(.success)
UIImpactFeedbackGenerator(style: .medium).impactOccurred()
UISelectionFeedbackGenerator().selectionChanged()
```

**Règles :**
1. **Jamais décoratif.** Uniquement sur vraie action.
2. **Toujours associé à visuel.** Haptic seul = confusion.
3. **Intensité = importance.** Light pour selection, medium pour toggle, heavy pour erreur/alerte.
4. **Pas en continu.** Une tap, pas une vibration.

### Web

```js
if ("vibrate" in navigator) {
  navigator.vibrate(10);  // Android only, iOS Safari ne supporte pas
}
```

**iOS Safari ne supporte pas les haptics web en 2026.** C'est une limitation connue. Pour native-like haptics, il faut une PWA ajoutée à l'écran d'accueil + tricks limités.

---

## XII. Sound design

**Précédents légendaires :**
- **Windows 95 startup** — Brian Eno, 3.25s, composé sur Mac.
- **Slack knock/brush** — signature sonore reconnaissable.
- **Playdate OS** — Simon Panrucker.
- **iOS keyboard clicks** — le toc subtil.
- **Tweetbot tick/tock** — Tapbots signature.

**Règles Stit'Claude :**
1. **Earcons, pas musique.** Un son court, identifiable, associé à une classe d'événements.
2. **Un son par classe d'événement.** Success / error / notification — pas 50 sons différents.
3. **Opt-in par défaut.** Jamais de son auto sans consentement user.
4. **Respect `prefers-reduced-motion`** comme proxy pour "no audio/haptics either."

**Web Audio API :**

```js
const ctx = new AudioContext();
function playTick() {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 800;
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}
```

---

## XIII. Librairies motion 2026

### Motion (ex-Framer Motion)
**Site :** motion.dev. Bundle : ~20KB gzipped (core). React + vanilla JS.
**Forces :** API propre, springs excellents, layout animations automatiques, independent 2024+.
**Quand l'utiliser :** React apps avec motion riche.

### Motion One
**Site :** motion.dev/one. Bundle : ~3.8KB. Vanilla JS wrapper du Web Animations API.
**Forces :** ultra-léger, performant, API similaire à Motion.
**Quand l'utiliser :** marketing pages, landings performance-critical.

### GSAP (GreenSock)
**Licence :** **gratuit pour tous usages depuis acquisition Webflow (avril 2024).**
**Forces :** timelines complexes, plugins riches (ScrollTrigger, Draggable, MorphSVG), précis.
**Quand l'utiliser :** animations narratives complexes, case studies, sites à fort storytelling.

### CSS pur (préféré quand suffisant)
**Forces :** pas de JS, natif browser, performant.
**Suffit pour :** transitions state, hover, focus, @starting-style, view-transitions.

---

## XIV. La signature motion Stit'Claude

**Ce qui distingue un motion bien fait :**

1. **Intent déclaré** — chaque animation a une raison (feedback, hiérarchie, spatialité).
2. **Tokens réutilisés** — jamais de durée/easing hardcodés ; toujours les tokens.
3. **≤300ms par défaut.**
4. **Spring pour gestes, bezier pour scripts.**
5. **Interruptible.**
6. **`prefers-reduced-motion` branché.**
7. **Haptics pair** sur les actions critiques (mobile natif).
8. **Sounds opt-in et earcons** uniquement.
9. **Peu, mais bien.** Mieux vaut 3 animations parfaites que 20 médiocres.
10. **Cohérent.** Même durée pour mêmes types d'actions. Same-kind pattern.

**Le test Rauno :**

> *"There must be a reason."*

Si tu ne peux pas dire pourquoi une animation existe, **retire-la**.
