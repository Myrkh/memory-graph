# references/houses.md — Les maisons numériques

> *Charge ce fichier quand tu dois déclarer une house dans le brief, ou quand tu étudies l'empreinte d'un produit numérique contemporain pour en extraire des enseignements précis.*

Chaque maison listée ci-dessous a une **patte numérique reconnaissable**. Stit'Claude en cite 2 ou 3 par brief, puis applique leurs règles spécifiques — jamais par mimétisme, toujours par compréhension.

---

## Linear — le monastère indigo

**Font :** Inter UI + SF Pro en fallback. Karri Saarinen (ex-Airbnb Cereal) a choisi délibérément de **ne pas** dessiner une police custom pour Linear. Le refus est le statement.

**Palette :**
- Brand `#5E6AD2` (indigo désaturé)
- Accent `#8299FF`
- Surface sombre `#222326` (jamais `#000`)
- Texte sombre `#F7F8F8`

**Radii :** 6–8px cartes, 4–6px pills — retenus, contenus. Jamais 16px+ sauf exception.

**Bordures :** 1px `rgba(255,255,255,0.08)`.

**Motion :** ≤200ms, easings linéaires, **jamais** d'overshoot. Saarinen : *"For me, work is serious. If I'm building a house, I don't want my tools to be fun. I want them to be good."*

**Paradigmes :** Cmd-K command palette partout. Shortcuts single-key. Issues avec ID lisible (ENG-123).

**Iconographie :** 16px outline, stroke 1.5px, terminaisons arrondies. Custom-made par le design team.

**Citations Saarinen à garder :**
- *"We started with quality. Then we learned that people actually noticed, because it's a rare approach — especially for startups."*
- *"Quality is when something feels alive. When something feels right, even if you can't exactly describe why."*
- *"The playbook of move-fast-and-break-things — I think that playbook is getting played out."*

**Quand citer Linear :** outils pros B2B, SaaS haut de gamme, command palette, outils internes, dashboards denses.

---

## Vercel / Geist — brutalist minimal dev-first

**Font :** **Geist Sans + Geist Mono + Geist Pixel** (Vercel, 2023, OFL, défaut Next.js 15+). Influences revendiquées : Inter, Univers, SF Mono, SF Pro, Suisse International, ABC Diatype.

**Palette :** pur `#000` / pur `#FFF`. Signal red et signal blue pour les accents sémantiques. Bordures hairline `rgba(255,255,255,0.08)`.

**Grille :** 4/8px.

**Type scale :** hero 72–96px. Boutons 4–6px ou pill.

**Motion author :** **Rauno Freiberg** (rauno.me).
- *"Make it fast. Make it beautiful. Make it consistent. Make it carefully. Make it timeless. Make it soulful. Make it."*
- *"There must be a reason."*
- Motion : 150–250ms ease-out.
- A écrit la lib `cmdk` (command menu React).

**Quand citer Vercel/Geist :** outils dev, landings produit tech pur, documentation technique, esthétique "serveur allumé".

---

## Stripe — docs comme art, mesh comme identité

**Font :** **Söhne** (Klim, Kris Sowersby, 2019 — *"the memory of Akzidenz-Grotesk framed through the reality of Helvetica"*) + Söhne Mono.

**Palette :**
- Brand blurple `#635BFF`
- Navy texte `#0A2540`
- Mesh hero (reverse-engineered) : `#5E46BF`, `#1CA8FF`, `#635BFF`

**Grille :** 8px. Hero 72–96px. Boutons 4–6px (pill sur marketing).

**Motion author :** Benjamin De Cock (ex-Stripe, now Cursor).
- *"Animations must either help users understand flow, or provide feedback."*
- 200–400ms, beziers custom, 3D hardware transforms, early adopter `prefers-reduced-motion`.

**Signature unique :** mesh gradient 3D WebGL (~10KB `MiniGl` class), le fond le plus imité du web.

**Quand citer Stripe :** documentation, landings SaaS premium, tout ce qui doit paraître "série dont on peut dépendre".

---

## Arc / The Browser Company → Dia

Arc a été sunset en 2025. The Browser Company acquise par Atlassian (~$610M). Dia est le successeur. L'ADN persiste.

**Couleur comme identité :** dégradés per-Space (salmon, mint, lavande, cobalt). Josh Miller cite Robert Irwin (artiste scrims) pour l'effet de bordure translucide interne.

**Chrome :** quasi-noir `#1C1C1F`.

**Radii :** obsession squircle, 18–24px superellipse.

**Motion :** spring physics **avec rebond**. Bouncy plus que snappy.

**Paradigmes uniques :** Boost (CSS/JS per-site), Easel (canvas infini intégré), auto-archive, Spaces.

**Quand citer Arc/Dia :** outils créatifs consumer, produits "à caractère", navigateurs et tabbed apps, apps qui veulent une personnalité.

---

## Raycast — la palette de commande qui scale

**Font :** system.

**Couleurs documentées :** Blue, Green, Magenta, Orange, Purple, Red, Yellow + PrimaryText / SecondaryText. Base sombre ~`#1A1A1A`–`#1E1E1E` (observé, non officiel).

**Grille :** 8px. Rangée command palette 36px.

**Iconographie :** James McDonald (2022 redesign). Outline, stroke plus épais, règles strictes sur stroke-width et radii.

**Manifesto :** *"fast, simple, delightful."*

**Motion :** ~120ms scale+fade à l'ouverture.

**Quand citer Raycast :** outils power-user macOS, launchers, command palettes riches, systèmes d'extension.

---

## Things 3 (Cultured Code)

**Font :** Apple system + spacing custom. Today blue = `#007AFF`.

**Row heights :** 40–44pt iOS (généreuses pour une app to-do).

**Motion :** spring-based partout, jamais décoratif.

**Signature unique :** **Magic Plus** — drag pour placer un nouvel item où on veut dans la liste.

**Iconographie :** hand-drawn par Christian Krämer. CEO : Werner Jainek.

**Quand citer Things :** apps iOS/iPadOS/macOS consumer premium, gestion tâches, apps "feelgood-but-serious".

---

## Panic (Nova, Transmit, Playdate)

**Type marketing historique :** **Colfax** (Process Type, ~2012). **Pas** Lab Grotesque (erreur commune).

**Couleurs :** jaune + violet signature. Playdate jaune = "Famicom Disk System yellow" (~`#FFD800`).

Cabel Sasser : *"We totally yoinked the Famicom Disk System yellow."*

**Collaboration :** manivelle Playdate co-designée avec Teenage Engineering (Jesper Kouthoofd).

**Ton de marque :** cabinet de curiosités, première personne chaleureuse.

**Quand citer Panic :** produits à caractère, outils dev qui veulent chaleur, marques consumer indie.

---

## Figma

**Palette 5 couleurs :** red-orange `#F24E1E`, coral `#FF7262`, purple `#A259FF`, blue `#1ABCFE`, green `#0ACF83`.

**Grille :** 8px.

**Type :** marketing Whyte (historique) ; produit = system fonts.

Dylan Field : *"One of our values as a company is play."*

**Quand citer Figma :** outils collaboratifs, design tools, produits qui veulent rigoureux + joueur.

---

## Notion

**Palette :**
- Canvas cream `#F7F6F3`
- Texte warm near-black `#37352F`
- Dark `#191919`

**Highlights :** 10 tints ultra-muted (Gray/Brown/Orange/Yellow/Green/Blue/Purple/Pink/Red backgrounds).

**Fonts :** system fonts only — refus délibéré de police custom.

**Culture emoji-as-icon :** 🎯 📝 ✨ — mais c'est **l'utilisateur** qui choisit, pas le produit.

**Paradigme :** slash command.

**Quand citer Notion :** outils document/knowledge, warmth minimaliste, produits où l'utilisateur amène sa personnalité.

---

## Apple HIG — iOS / macOS 26 (unifié WWDC 2025)

**Liquid Glass** (Alan Dye, juin 2025) : *"a new digital meta-material that dynamically bends and shapes light."* Lensing, specular highlights, adaptive tint, ancestor visionOS. **À utiliser avec parcimonie** — Apple recommande explicitement la retenue.

**Typographie :** SF Pro + SF Pro Display + SF Mono + SF Rounded + SF Symbols 7.

**Corners :** squircle G2-continu partout. Controls utilisent `concentricShape` — radius enfant concentrique avec parent.

**Motion :**
- `.smooth` → response 0.5, damping 1.0 (no bounce)
- `.snappy` → response 0.3, damping 0.85 (léger bounce)
- `.bouncy` → response 0.5, damping 0.7 (rebond prononcé)

**Principes fluid interfaces (WWDC 2018, Chan Karunamuni) :** detachment, physics-driven, interruptibility, rubber-banding, acceleration matching, direct manipulation.

**Quand citer Apple HIG :** toute app native iOS/iPadOS/macOS/watchOS/tvOS/visionOS 26+, produits premium consumer.

---

## Material 3 / Material You (Google)

**Dynamic Color :** extraction depuis wallpaper → 13 tones.

**Type roles :** 15 baseline + 15 emphasized (Display / Headline / Title / Body / Label × Large/Medium/Small).

**Surface elevation :** tonal (teinte), pas d'ombre.

**Shape scale :** 10 steps.

**Motion easings :**
- Emphasized : `cubic-bezier(0.2, 0.0, 0, 1.0)`
- Emphasized-decelerate : `cubic-bezier(0.05, 0.7, 0.1, 1.0)`
- Emphasized-accelerate : `cubic-bezier(0.3, 0.0, 0.8, 0.15)`
- Standard : `cubic-bezier(0.2, 0.0, 0, 1.0)`

**Durations (M3) :** short 50/100/150/200ms, medium 250/300/350/400ms, long 450/500/550/600ms, extra-long 700/800/900/1000ms.

**Quand citer Material 3 :** apps Android, produits multi-plateforme qui veulent Dynamic Color, expressivité contrôlée.

---

## Fluent 2 (Windows 11/12, Microsoft)

**Matériaux :**
- **Mica** (opaque, sampled wallpaper — léger en perf, pour surfaces long-life).
- **Mica Alt** (teinte plus forte, title bars tabbed).
- **Acrylic** (flou live, translucide, **transient uniquement** — flyouts, menus).
- **Smoke** (dim modal).

**Font :** Segoe UI Variable.

**Reveal :** retiré depuis WinUI 2.6.

**Quand citer Fluent 2 :** apps Windows natives, outils Microsoft-ecosystem, produits qui veulent respecter l'OS hôte.

---

## Anthropic Design (Claude.ai, Claude API)

**Palette (observée sur Claude.ai) :**
- Dark `#141413`
- Cream `#FAF9F5`
- Coral `#D97757` (Claude orange)
- Blue `#6A9BCC`
- Green `#788C5D`

**Type :** système sans + un serif interne ("Copernicus", non commercialisé, visible via noms CSS).

**Signature :** chaleur (cream + coral), densité moyenne, motion feutrée, emphase sur la lisibilité du texte long.

**Quand citer Anthropic Design :** outils AI-natifs, interfaces de conversation, produits qui veulent chaleur intellectuelle.

---

## Autres maisons de grande tenue

- **Superhuman** — dense, keyboard-first, onboarding 1-sur-1 comme feature. Inter + mono subtil. Cmd-K.
- **Height** — similar power-dense, palettes fraîches.
- **Cron → Notion Calendar** — density + delight.
- **Readdle / Spark** — iOS craft.
- **Ivory (Tapbots)** — Mastodon client. Paul Haddad engineering, Mark Jardine design. Custom haptics, custom sounds, chunky delightful UI.
- **Basecamp / 37signals** — opinionated warmth, rejet des trends. Jason Fried.
- **Obsidian / Bear / iA Writer** — reverence pour le texte.
- **Craft** — documents premium iOS/Mac.
- **Shadcn/ui** — open-source, systematized, mais à **ne jamais livrer nature**. Toujours le composer, l'habiller, l'identifier.
- **Untitled UI / Radix UI / Ariakit / Park UI / Base UI** — primitives, pas esthétique. Système d'os, pas de peau.

---

## Règle Stit'Claude pour citer les houses

Dans le brief d'intention, ligne `RÉFÉRENCES`, cite **au moins une maison numérique contemporaine** + **au moins un designer du panthéon** (voir `pantheon.md`). Exemple :

> *"Linear (densité, ≤200ms, indigo désaturé) + Rams (unobtrusive, honest) + Müller-Brockmann (grille 12-col, baseline 8pt)"*

Cette triangulation force une **ancrage temporel** (passé lointain + passé proche) et évite la copie directe d'une seule source.
