# references/antislop.md — Le registre des interdits

> *Charge ce fichier avant toute livraison. Scanne ton output contre cette liste. Si un pattern apparaît, retire-le ou remplace-le par l'alternative indiquée.*

Ces 30 patterns sont les marqueurs d'un design généré par IA sans soin. Stit'Claude n'en produit **aucun**. Jamais.

Pour chaque pattern, la structure est :
- **NEVER** — ce qu'il ne faut jamais faire.
- **POURQUOI** — pourquoi c'est du slop.
- **INSTEAD** — l'alternative.

---

### 1. Le dégradé purple-pink-blue Tailwind

**NEVER :** `from-purple-600 via-pink-500 to-blue-600` ou équivalent dans les héros de landing.
**POURQUOI :** c'est le dégradé par défaut de la documentation Tailwind. Tout le monde l'utilise. Il signale "j'ai copié le premier tutoriel venu". Il date d'emblée (2020–2024).
**INSTEAD :** un seul accent OKLCH intentionnel sur fond neutre. Si tu dois un dégradé, choisis 2 couleurs proches en hue (≤30° d'écart) dans OKLCH, ou un dégradé tonal (du clair au foncé dans la même hue).

---

### 2. Les blur orbs flottants

**NEVER :** `<div class="absolute blur-3xl opacity-30 bg-purple-500 rounded-full">` flottant derrière le héros.
**POURQUOI :** atmosphère gratuite. Ne signifie rien. Dégrade les Core Web Vitals (blur coûte cher GPU).
**INSTEAD :** un fond uni soigné, ou une texture signifiante (grille subtile SVG, bruit imperceptible, gradient tonal propre). Si tu veux du volume, fais un vrai Liquid Glass ou un vrai mesh (Stripe-level), ou rien.

---

### 3. Les générateurs de mesh gradients (mesh.hyp.lol et clones)

**NEVER :** SVG mesh gradient random collé en background.
**POURQUOI :** c'est le même mesh que 10 000 autres sites. Signature zéro.
**INSTEAD :** si mesh gradient, dessine-le à la main (WebGL avec couleurs de la charte), ou remplace par un fond plat avec une seule forme géométrique soignée.

---

### 4. Le bento grid de tuiles égales

**NEVER :** 6 tuiles de même taille, chacune avec headline + icon + 2 lignes de texte.
**POURQUOI :** Apple a popularisé le bento (WWDC 2023) avec **hiérarchie**. Le copier sans hiérarchie = cargo cult.
**INSTEAD :** bento **avec hiérarchie** (une tuile 2x2, une 2x1, deux 1x1), chaque tuile avec une densité différente, typographie différenciée, une seule couleur d'accent qui traverse.

---

### 5. Les trois cartes centrées "Fast / Secure / Easy"

**NEVER :** trois cards avec icône + titre + phrase, disposées en grille régulière, chacune annonçant une feature générique.
**POURQUOI :** le template SaaS qui sent le template. Zéro narration.
**INSTEAD :** un seul argument bien dit, ou une liste longue honnête (une feature par ligne, typographique), ou une démo/screenshot qui fait la démonstration sans texte.

---

### 6. Le hero générique SaaS complet

**NEVER :** la structure canonique *hero (centered headline + subtitle + 2 buttons) → trust bar logos → 3-card features → testimonials → pricing 3 plans → FAQ accordion → CTA*.
**POURQUOI :** 80% des sites SaaS y ressemblent. Aucune identité.
**INSTEAD :** laisse **le contenu dicter la structure**. Un produit technique peut ouvrir sur un tableau de specs. Un produit éditorial peut ouvrir sur un long paragraphe. Un produit visuel peut ouvrir sur une démo interactive sans texte. Varie.

---

### 7. Lorem ipsum et copy IA générique

**NEVER :** "Revolutionize your workflow with our AI-powered solution", "Empower your team to achieve more", "The future of X is here". Lorem ipsum en production.
**POURQUOI :** copy de slides de pitch deck clichés.
**INSTEAD :** copy réelle, ou placeholder explicite avec marqueur `[TODO: copy client]`, ou copy qui nomme des faits concrets ("Calcule PFD/PFH en <100ms, exporte en PDF signé IEC 61511").

---

### 8. Les emoji 🚀⚡🎯✨ comme iconographie produit

**NEVER :** emoji platform comme icônes de sections ou de boutons dans un produit pro.
**POURQUOI :** les emoji changent de rendu selon l'OS/navigateur, ne respectent pas la charte, signalent la précipitation.
**INSTEAD :** iconographie conçue. SF Symbols si Apple. Lucide, Phosphor, Tabler, Heroicons outline si multi-plateforme. Custom (commissionnée ou dessinée) si premium.

---

### 9. `<Sparkles />` / `<Wand2 />` sur toute feature "AI"

**NEVER :** l'icône étoiles-qui-scintillent sur chaque bouton ou section parlant d'IA.
**POURQUOI :** tic universel post-2022. Signalera "je suis d'une époque" dans 3 ans.
**INSTEAD :** une icône métier (ex. une loupe pour search AI-powered, un filtre pour filter AI-powered), ou pas d'icône du tout.

---

### 10. Shadcn `<Card>` non modifié empilé

**NEVER :** trois `<Card>` par défaut avec `<CardHeader>`, `<CardContent>`, `<CardFooter>` sans jamais toucher aux tokens.
**POURQUOI :** shadcn est un **kit d'os**. Livré brut, il signale "j'ai mis shadcn et c'est tout".
**INSTEAD :** compose, habille, identifie. Change les radii, les paddings, les bordures, ajoute un détail signature (une hairline top colorée, une indentation optique, une numérotation monospace). Toujours.

---

### 11. Les paires couleur par adjectif ("vibrant coral + warm teal")

**NEVER :** sortir deux couleurs "parce qu'elles s'accordent" sans système.
**POURQUOI :** pas de raison → pas d'âme.
**INSTEAD :** une couleur de marque motivée (recherche, héritage, test APCA), plus une échelle neutre. Ajoute un accent secondaire **seulement si** tu peux dire **pourquoi**.

---

### 12. Le drop shadow décoratif partout

**NEVER :** `shadow-lg` sur chaque carte, chaque bouton, chaque tableau.
**POURQUOI :** Apple et Google (2018+) sont passés au surface-tonal. L'ombre décorative date.
**INSTEAD :** bordure hairline (0.5–1px à ~8% opacité) ou surface tonal elevation (shift légèrement plus clair/foncé). Ombre **seulement** pour les overlays flottants réels (dropdown, modal, tooltip), et subtile.

---

### 13. Les badges rotatifs "✨ AI-powered"

**NEVER :** badge qui tourne en permanence en haut à droite d'une carte.
**POURQUOI :** attention-grabbing cheap. Dégrade l'expérience des user réguliers.
**INSTEAD :** un label typographique discret, ou pas de badge.

---

### 14. "Built with Next.js and Tailwind" dans le footer

**NEVER :** mentionner la stack technique en footer marketing.
**POURQUOI :** signal "bootcamp project". Aucun vrai produit pro ne fait ça.
**INSTEAD :** rien, ou un crédit design/dev authentique.

---

### 15. Les "trusted by" logos grisés sans hiérarchie

**NEVER :** bar de 10+ logos d'entreprises en grayscale, défilant.
**POURQUOI :** social proof faux (si tu étais vraiment trusted par IBM, tu mettrais un case study). Défile = cache la liste réelle.
**INSTEAD :** 3–5 logos en couleur, en grille claire, avec citations ou cases studies liés. Ou retire.

---

### 16. `bg-clip-text` gradient sur titres critiques

**NEVER :** `bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent` sur titres importants.
**POURQUOI :** ruine le contraste, casse l'accessibilité, date immédiatement (2020–2024 tic).
**INSTEAD :** type plate + couleur intentionnelle, ou si tu veux un moment "spécial" : type massive + contrastée. Les gradients sur text sont réservés aux **moments narratifs rares**.

---

### 17. Les stats inventées

**NEVER :** "10M+ users", "300% growth", "$5B saved" sans source.
**POURQUOI :** mensonge ou approximation bullshit.
**INSTEAD :** chiffres réels avec source (ou absent si pas de chiffres défendables).

---

### 18. Copier le style isométrique Stripe

**NEVER :** illustrations 3D isométriques avec building blocks, pastels, personnages souriants.
**POURQUOI :** le style Stripe 2018–2021, now generic SaaS.
**INSTEAD :** photo réelle, schéma technique honnête, illustration custom par un·e vrai·e illustrateur·ice, ou typographie seule.

---

### 19. Dark mode = `#000` + `#FFF` + couleurs inchangées

**NEVER :** `background: #000; color: #fff;` et accents identiques au light mode.
**POURQUOI :** n'est pas du dark mode — c'est une inversion paresseuse qui fatigue l'œil (les accents saturés vibrent sur noir pur).
**INSTEAD :** base `oklch(0.14–0.20 0 0)` (jamais `#000`), texte `oklch(0.96 0 0)` ou `rgba(255,255,255,0.87)`, accents désaturés de 10–20% en chroma, élévation par tint.

---

### 20. Glow halos colorés sur hover

**NEVER :** `box-shadow: 0 0 40px 8px var(--brand)` au hover d'un bouton.
**POURQUOI :** tic de 2020–2023, fait "arcade machine" dans un contexte pro.
**INSTEAD :** changement subtil de brightness (`color-mix(in oklch, var(--brand) 90%, white)`), ou bordure qui apparaît, ou rien (les bons boutons n'ont pas besoin de glow).

---

### 21. Le template Framer / Super portfolio

**NEVER :** livrer le look "portfolio générique" avec hero fullscreen + scroll horizontal + carousel projets + contact form.
**POURQUOI :** 10 000 freelances ont ce site.
**INSTEAD :** structure dictée par le corpus réel. Un portfolio de 3 gros projets = 3 pages dédiées. Un portfolio de 30 projets = index typographique massif.

---

### 22. Word-by-word scroll reveal

**NEVER :** chaque mot d'un paragraphe apparaît successivement au scroll.
**POURQUOI :** coûteux en attention, frustrant, agresse `prefers-reduced-motion`.
**INSTEAD :** fade simple d'un block entier, ou pas d'animation au scroll du tout (la lecture est l'animation).

---

### 23. Next.js / Vercel starter home unchanged

**NEVER :** livrer la home `create-next-app` avec son hero "Welcome to Next.js" et ses 4 cards "Docs / Learn / Templates / Deploy".
**POURQUOI :** évident.
**INSTEAD :** design from scratch avec brief d'intention Phase 1.

---

### 24. AI-generated hero images "smiling diverse laptop users"

**NEVER :** stock photo / IA-générée de 4 personnes de diverses ethnies souriant autour d'un laptop.
**POURQUOI :** artifice social, sent le stock.
**INSTEAD :** photo réelle du produit, screenshot réel, schéma, ou typographie.

---

### 25. "No credit card required" sous chaque CTA

**NEVER :** la même micro-copy sous chaque bouton.
**POURQUOI :** redondance, indique un copy-paste de template growth.
**INSTEAD :** la dire **une fois**, au moment pertinent (landing ou pricing), pas partout.

---

### 26. `text-balance` sur titres courts

**NEVER :** `text-wrap: balance` sur un titre de 2–3 mots.
**POURQUOI :** `balance` est pour les titres multi-lignes. Sur titres courts, il ne fait rien ou introduit du reflow.
**INSTEAD :** `text-wrap: balance` uniquement sur titres 2+ lignes. `text-wrap: pretty` sur paragraphes longs.

---

### 27. `backdrop-blur-xl` sur nav sur fond blanc plat

**NEVER :** `bg-white/80 backdrop-blur-xl` alors que le fond derrière est blanc uni.
**POURQUOI :** blur ne fait rien s'il n'y a rien à flouter. Tu dégrades les perfs pour rien.
**INSTEAD :** si fond blanc → nav opaque avec bordure hairline. Blur seulement si contenu riche ou image passe dessous.

---

### 28. Widget AI chat bottom-right sur site marketing

**NEVER :** le bouton chat qui flotte en bas à droite alors qu'il n'y a pas vraiment de support à répondre.
**POURQUOI :** fake helpfulness.
**INSTEAD :** un lien "Contact" clair, ou un chat réel avec vrai SLA.

---

### 29. SVG counters animés au scroll

**NEVER :** "0 → 1,234,567" qui compte au scroll.
**POURQUOI :** 2015–2020 tic. Cheap, agresse reduced-motion.
**INSTEAD :** afficher le chiffre direct, en typographie soignée (tabular nums, font-size généreux).

---

### 30. Grille de 20 logos d'intégrations

**NEVER :** "We integrate with everything" + mur de 20 logos égaux.
**POURQUOI :** dit que rien n'est important. Rend la page lourde.
**INSTEAD :** 3–5 intégrations phares mises en scène (avec screenshot/use case), et un lien "voir toutes les 47 intégrations" vers une page dédiée.

---

## La meta-règle — le filtre Vignelli/Rams/Saarinen

Avant de livrer un composant, un écran, une page : demande

> *"Si je retirais cet élément, est-ce que le design perdrait son sens ?"*

Si la réponse est **non** → retire-le.
Si la réponse est **oui** → garde-le et soigne-le au centième de pixel.

Rien n'est là pour faire joli. Tout est là pour signifier.

---

## Les quatre anti-slop méta-rules

1. **Pas de décoration sans signification.** Chaque pixel justifie son existence par un usage utilisateur ou par une hiérarchie.
2. **Pas de trend sans conscience historique.** Si tu utilises Liquid Glass, du bento, du squircle, cite la tradition et justifie le choix.
3. **Pas de signal fake.** Pas de badges, pas de social proof inventé, pas de copy gonflée.
4. **Pas de défaut brut.** Rien ne sort "comme installé". Shadcn, Tailwind, Next.js : composés, pas livrés.

Ces patterns sont les **poisons** du design IA. Stit'Claude les détecte et les retire.
