# references/print-pdf.md — L'imprimé et le PDF

> *Charge ce fichier quand le livrable est destiné à l'impression ou au PDF. C'est un medium majeur, souvent négligé par les designers digitaux, et une signature Stit'Claude forte.*

Un designer **full-stack, full-support** doit savoir livrer un PDF propre. Rapports techniques, whitepapers, livres blancs, documentation pro, rapports d'expertise, propositions commerciales : autant de formats où le design digital échoue sans un minimum de métier print.

---

## I. Les trois grandes voies techniques

### 1. CSS Paged Media (web-first)

Produire un PDF depuis HTML+CSS, avec pagination contrôlée par CSS.

**Outils :**
- **Paged.js** (open-source, GPL) — polyfill CSS Paged Media dans le browser. Prévisualise + exporte. Excellent pour workflow web.
- **Prince XML** (commercial, ~$3800) — **la** référence. Utilisé par l'industrie de l'édition. Support CSS Paged Media le plus complet.
- **WeasyPrint** (Python, BSD) — support solide CSS Paged Media, open-source, moins complet que Prince mais suffisant pour 95% des cas.
- **Vivliostyle** (open-source) — éditeur web + viewer + CLI pour Paged Media.
- **Puppeteer / Chromium headless** — pour cas simples. Pas de vraie pagination (juste "print to PDF" du moteur).

**Avantages CSS Paged Media :**
- Réutilise compétences web.
- Data-driven : un template HTML + JSON = n rapports.
- Web + print = même source.

**Inconvénients :**
- Math complexe limité (KaTeX OK, MathJax via render SSR, LaTeX natif non).
- Tables complexes : Prince > WeasyPrint.
- Fonts : WOFF2 supporté, license à vérifier pour embarquer.

### 2. Typst (Rust, moderne)

Alternative LaTeX née en 2023 (Typst GmbH, Berlin). Compilation en millisecondes (vs minutes pour LaTeX complexe).

**Forces :**
- Syntaxe propre et moderne.
- Compilation incrémentale rapide.
- Math support natif (syntaxe plus lisible que LaTeX).
- Templates communautaires riches.
- Packages Typst Universe (équivalent CTAN).

**Faiblesses :**
- Jeune (2023) — moins de templates scientifiques niches que LaTeX.
- Moins connu des clients / journals académiques.

**Quand l'utiliser :** rapports techniques en interne, documentation produit, livres blancs où la vitesse de compilation matters.

### 3. LaTeX / XeLaTeX / LuaLaTeX

Le roi de l'impression scientifique depuis 40 ans.

**Forces :**
- Math impeccable.
- Packages pour tout (siunitx, chemfig, tikz, pgfplots, booktabs…).
- Accepté universellement en science / industrie lourde.
- `siunitx` pour les unités (espaces fines insécables automatiques, formats cohérents).
- `booktabs` pour les tableaux.
- `microtype` pour le sub-pixel polish typographique.
- `biblatex` + `biber` pour bibliographie propre.

**Faiblesses :**
- Compilation lente sur documents complexes.
- Syntaxe exigeante.
- Debugging des packages difficile.

**Quand l'utiliser :** rapports d'expertise officiels, papers, thèses, livrables normatifs (IEC, ISO), livres.

### 4. React PDF / pdfmake (dynamiques)

Pour rapports générés programmatiquement avec beaucoup de données :
- **@react-pdf/renderer** — JSX → PDF. Bon pour rapports avec templates complexes.
- **pdfmake** — JSON → PDF. Moins expressif mais plus simple.
- **Playwright / Puppeteer** → HTML → PDF pour cas intermédiaires.

---

## II. CSS Paged Media — recipe complet

```css
/* ============================================================
   Configuration de la page
   ============================================================ */

@page {
  size: A4;                              /* ou "Letter", "A3", "210mm 297mm" */
  margin: 25mm 20mm 25mm 20mm;           /* top right bottom left */

  /* Marks pour la prépresse (optionnel) */
  /* marks: crop cross; */
  /* bleed: 3mm; */

  /* Header */
  @top-left {
    content: string(doc-title);
    font-family: "IBM Plex Sans", sans-serif;
    font-size: 9pt;
    color: oklch(0.45 0 0);
  }
  @top-center { content: none; }
  @top-right {
    content: "Doc. " string(doc-id);
    font-family: "IBM Plex Mono", monospace;
    font-size: 9pt;
    color: oklch(0.45 0 0);
    font-variant-numeric: tabular-nums;
  }

  /* Footer */
  @bottom-left {
    content: "Confidentiel — " string(client);
    font-size: 9pt;
    color: oklch(0.55 0 0);
  }
  @bottom-center { content: none; }
  @bottom-right {
    content: counter(page) " / " counter(pages);
    font-variant-numeric: tabular-nums;
    font-size: 9pt;
  }
}

/* Première page : pas de header */
@page :first {
  @top-left { content: none; }
  @top-right { content: none; }
  margin-top: 40mm;
}

/* Pages gauches / droites (pour livres reliés) */
@page :left {
  margin-left: 30mm;
  margin-right: 20mm;
}
@page :right {
  margin-left: 20mm;
  margin-right: 30mm;
}

/* ============================================================
   Named pages pour sections spéciales
   ============================================================ */

@page chapter-start {
  @top-left { content: none; }
  @top-right { content: none; }
  margin-top: 50mm;
}

.chapter { page: chapter-start; }

/* ============================================================
   Strings (header dynamique)
   ============================================================ */

h1.chapter-title {
  string-set: doc-title content();
  page-break-before: always;
}

.meta-doc-id { string-set: doc-id content(); }
.meta-client { string-set: client content(); }

/* ============================================================
   Contrôle des sauts de page
   ============================================================ */

h1, h2 {
  page-break-after: avoid;     /* pas de saut juste après un titre */
  break-after: avoid;
}

h1 {
  page-break-before: always;   /* chaque h1 = nouvelle page */
  break-before: page;
}

table, figure, .no-break {
  page-break-inside: avoid;
  break-inside: avoid;
}

p {
  orphans: 3;   /* min 3 lignes en bas de page */
  widows: 3;    /* min 3 lignes en haut de page */
}

/* ============================================================
   Cross-references (links clickables en PDF)
   ============================================================ */

a.ref[href^="#"]::after {
  content: " (p. " target-counter(attr(href url), page) ")";
  color: oklch(0.45 0 0);
  font-size: 0.9em;
}

/* ============================================================
   Numbering (chapitres, figures, tables)
   ============================================================ */

body { counter-reset: chapter figure table; }

h1 { counter-increment: chapter; counter-reset: section figure table; }
h1::before { content: counter(chapter) ". "; }

h2 { counter-increment: section; }
h2::before { content: counter(chapter) "." counter(section) " "; }

figure { counter-increment: figure; }
figcaption::before {
  content: "Figure " counter(chapter) "." counter(figure) " — ";
  font-weight: 600;
}

table { counter-increment: table; }
table caption::before {
  content: "Tableau " counter(chapter) "." counter(table) " — ";
  font-weight: 600;
}

/* ============================================================
   Table of contents (auto-generated)
   ============================================================ */

.toc li a::after {
  content: leader(".") target-counter(attr(href url), page);
  font-variant-numeric: tabular-nums;
}

/* ============================================================
   Typographie print
   ============================================================ */

html {
  font-family: "IBM Plex Serif", "Source Serif 4", Georgia, serif;
  font-size: 10.5pt;
  line-height: 1.55;
  color: oklch(0.18 0 0);
}

h1 { font-family: "IBM Plex Sans", sans-serif; font-weight: 600; font-size: 24pt; margin-top: 0; }
h2 { font-family: "IBM Plex Sans", sans-serif; font-weight: 600; font-size: 16pt; }
h3 { font-family: "IBM Plex Sans", sans-serif; font-weight: 600; font-size: 12pt; }

/* Chiffres toujours tabulaires en contexte technique */
.data, td, .num { font-variant-numeric: tabular-nums; }

/* Mono pour formules, code, références */
code, kbd, .mono {
  font-family: "IBM Plex Mono", "JetBrains Mono", monospace;
  font-size: 0.9em;
}

/* Règles fines partout */
table { border-collapse: collapse; width: 100%; }
th, td {
  border-top: 0.5pt solid oklch(0.85 0 0);
  padding: 4pt 8pt;
  text-align: left;
}
th { border-bottom: 1pt solid oklch(0.25 0 0); font-weight: 600; }
tr:last-child td { border-bottom: 1pt solid oklch(0.25 0 0); }

/* ============================================================
   Règles FR
   ============================================================ */

html[lang="fr"] { hyphens: auto; }

/* Espaces fines insécables avant ponctuation double (FR).
   Géré au mieux par la lib paged.js ou par preprocessing du HTML.
   En CSS pur : pas de solution automatique parfaite. */
```

---

## III. Typst — syntaxe et snippets essentiels

```typ
#set document(
  title: "Rapport SIL — Système de détection incendie",
  author: "Yoann / Artelia",
  keywords: ("SIL", "IEC 61511", "Safety Integrity Level"),
)

#set page(
  paper: "a4",
  margin: (top: 25mm, bottom: 25mm, left: 20mm, right: 20mm),
  header: [
    #set text(9pt, fill: luma(70))
    #grid(
      columns: (1fr, auto),
      [Rapport SIL — Détection incendie],
      [Doc. #counter(page).display("1")],
    )
    #line(length: 100%, stroke: 0.5pt + luma(180))
  ],
  footer: [
    #line(length: 100%, stroke: 0.5pt + luma(180))
    #set text(9pt, fill: luma(90))
    #grid(
      columns: (1fr, 1fr),
      [Confidentiel — TotalEnergies],
      align(right)[#counter(page).display("1") / #counter(page).final().at(0)]
    )
  ],
)

#set text(
  font: "IBM Plex Serif",
  size: 10.5pt,
  lang: "fr",
  region: "FR",
)

#set par(justify: true, leading: 0.7em)

#set heading(numbering: "1.1.1")

// Unités (équivalent siunitx)
#let unit(n, u) = $#n$#h(0.2em)#u

// Figure numérotée
#figure(
  table(
    columns: (auto, auto, auto),
    stroke: 0.5pt + luma(180),
    align: (left, right, right),
    [Composant], [PFD], [RRF],
    [Détecteur #sub[1]], [$1.2 times 10^(-3)$], [833],
    [Détecteur #sub[2]], [$1.5 times 10^(-3)$], [667],
  ),
  caption: [PFD par composant — configuration 1oo2],
)
```

**Templates Typst utiles :**
- `ieee` — papers IEEE
- `acm` — papers ACM
- `jmlr` — Journal of Machine Learning Research
- `charged-ieee`, `basic-appreciation-letter`, `modern-cv`
- Communauté : typst.app/universe

---

## IV. LaTeX — préambule Stit'Claude pour rapport technique

```latex
\documentclass[11pt,a4paper,twoside]{article}

% =====================================================
% Moteur et encodages
% =====================================================
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[french]{babel}     % règles FR : espaces fines, guillemets, …

% =====================================================
% Polices (XeLaTeX ou LuaLaTeX recommandés)
% =====================================================
% Avec pdflatex :
\usepackage{ebgaramond}        % serif classique OFL
% ou :
% \usepackage{plex-serif}      % IBM Plex Serif
% \usepackage{plex-sans}
% \usepackage{plex-mono}

% =====================================================
% Typography polish
% =====================================================
\usepackage{microtype}         % sub-pixel polish (kerning, expansion)
\usepackage{csquotes}          % guillemets corrects
\usepackage{setspace}
\onehalfspacing                % 1.5 leading

% =====================================================
% Mise en page
% =====================================================
\usepackage[
  a4paper,
  top=25mm, bottom=25mm,
  inner=30mm, outer=20mm,
  headsep=8mm, footskip=10mm
]{geometry}

\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[LE,RO]{\small\thepage}
\fancyhead[RE]{\small\leftmark}
\fancyhead[LO]{\small Rapport SIL}
\renewcommand{\headrulewidth}{0.4pt}

% =====================================================
% Sciences et unités
% =====================================================
\usepackage{amsmath, amssymb}
\usepackage{siunitx}
\sisetup{
  locale = FR,
  group-separator = {\,},
  output-decimal-marker = {,},
  per-mode = fraction,
  product-units = single,
  exponent-product = \cdot,
}

% =====================================================
% Tableaux
% =====================================================
\usepackage{booktabs}          % \toprule \midrule \bottomrule
\usepackage{array}
\usepackage{longtable}

% =====================================================
% Figures et references
% =====================================================
\usepackage{graphicx}
\usepackage[hidelinks]{hyperref}
\usepackage{cleveref}

% =====================================================
% Bibliographie
% =====================================================
\usepackage[
  style=iso-numeric,
  backend=biber,
  sorting=none,
]{biblatex}
\addbibresource{references.bib}

% =====================================================
% Métadonnées PDF
% =====================================================
\hypersetup{
  pdftitle={Rapport SIL — Système de détection incendie},
  pdfauthor={Yoann / Artelia},
  pdfsubject={IEC 61511 — Fonction Instrumentée de Sécurité},
  pdfkeywords={SIL, IEC 61511, PFD, SIF},
}

\begin{document}

% Exemple de donnée avec unité et tabular
\begin{tabular}{lS[table-format=1.2e-1]S[table-format=3.0]}
  \toprule
  Composant & {PFD} & {RRF} \\
  \midrule
  Détecteur 1oo2 & 1.2e-3 & 833 \\
  Logic solver   & 5.0e-5 & 20000 \\
  Vanne FV-101   & 3.8e-3 & 263 \\
  \bottomrule
\end{tabular}

% Unité in-line
La fréquence observée est \SI{1.5e-3}{\per\hour}, soit un RRF de \num{667}.

\end{document}
```

---

## V. Typographie scientifique — règles Stit'Claude

### Corps de texte

- **Taille** : 10–11pt pour technique, 11–12pt pour éditorial.
- **Serif préféré** : Tiempos Text, IBM Plex Serif, Source Serif, Libertinus, EB Garamond, Cormorant Infant. Pourquoi serif ? Les empattements guident l'œil sur longueur, et le serif a l'autorité du livre.
- **Sans acceptable** : IBM Plex Sans, Inter, Söhne pour rapports modernes.
- **Leading** : 1.4–1.55 pour serif, 1.5–1.65 pour sans.
- **Mesure** : 60–75 caractères par ligne. Plus = fatigue. Moins = hachage.

### Chiffres

**Toujours tabulaires** dans un contexte data (tableaux, équations, KPIs).

```css
.data, td.num {
  font-variant-numeric: tabular-nums lining-nums;
}
```

En contexte corps, **old-style** (si la police les a) pour mieux s'intégrer :
```css
p { font-variant-numeric: oldstyle-nums proportional-nums; }
```

### Unités

Toujours **espace fine insécable** (U+202F) entre nombre et unité : `450 h`, pas `450h` ni `450 h` (l'espace normale casse au retour à la ligne).

En LaTeX : `\SI{450}{\hour}` avec siunitx.
En HTML : `450&#x202f;h` ou via preprocessing.
En Typst : `450#h(0.2em)h` ou macro custom.

### Équations

Pour PDF :
- **LaTeX/Typst** : natif, gold standard.
- **KaTeX** server-side : rapide, ne supporte pas tout LaTeX mais 95%.
- **MathJax** SSR : tout LaTeX, plus lourd.

Typographie des équations :
- Variables en italique (convention).
- Fonctions (sin, cos, log, max…) en roman.
- Matrices en **bold** ou double-struck.
- Numérotation à droite, tabular.

### Tableaux scientifiques (Tufte-approved)

**Règles Edward Tufte** (*Visual Display of Quantitative Information*, 1983) :
1. **Data-ink ratio** maximal — réduis la "non-data ink".
2. Pas de grille complète — `\toprule`, `\midrule`, `\bottomrule` (package `booktabs`) suffit.
3. Pas de couleur décorative — couleur **seulement** si elle porte de l'information.
4. Aligne les décimales des chiffres (`S[table-format=…]` en siunitx).
5. Small multiples > un gros graphique.
6. Sparklines pour tendances in-line.

### Cross-references

- Toujours cliquables en PDF (`hyperref` en LaTeX, automatiques dans Paged.js avec `target-counter`).
- Format : "Figure 3.2 (p. 15)" pour cross-chapter, "fig. 2" pour in-chapter.

---

## VI. Règles FR pour rapports

- **Espaces fines insécables** avant `: ; ? ! » %` et après `«`. Gérées par `babel[french]` en LaTeX, par le preprocessing en HTML.
- **Guillemets français** : `« »` avec espaces fines insécables. Pas `" "`.
- **Majuscules accentuées** : É, À, Ç obligatoires. Éviter `Ecole` → `École`.
- **Tirets** :
  - Tiret cadratin `—` (U+2014) pour incises : « C'est — évidemment — ainsi. »
  - Tiret demi-cadratin `–` (U+2013) pour intervalles : « p. 12–18 ».
  - Trait d'union `-` pour mots composés.
- **Millier** : espace fine insécable `1 234,56` (pas de virgule millier).
- **Décimale** : virgule, pas point.
- **Date** : `15 janvier 2026` en plein texte, `15/01/2026` en tableau dense.
- **Abréviations** : `M.` (Monsieur), `Mme` (Madame, sans point), `Mmes`, `Mlle`, `cf.`, `etc.` (sans etc. etc.), `p.` (page), `pp.` (pages), `chap.`, `fig.`, `tab.`.
- **Titres ouvrages** : italique (livres, revues), romain entre guillemets (articles, chapitres).

---

## VII. Format et export

**PDF/A-1b ou PDF/A-2b** pour archivage long terme (obligatoire pour dossiers réglementaires) :
- En LaTeX : `\usepackage[a-2b]{pdfx}` avec métadonnées XMP.
- En Paged.js : Prince export avec `--pdf-profile=pdf/a-2b`.
- Typst : export natif supporté.

**Embedding fonts** : obligatoire. `\embedall` en LaTeX, automatique en Typst, configurable en Prince.

**Couleurs** :
- Web/écran : sRGB.
- Impression quadri : **CMYK**. Convertir depuis sRGB avec profil ICC (Fogra39 pour Europe, SWOP pour US).
- Spot colors (Pantone) : pour branding impression haut de gamme.

---

## VIII. Références Tufte — les 4 règles à ne jamais oublier

1. **Show the data.**
2. **Maximize the data-ink ratio.**
3. **Erase non-data-ink.**
4. **Erase redundant data-ink.**

Et la règle cardinale :

> *"Graphical excellence is that which gives to the viewer the greatest number of ideas in the shortest time with the least ink in the smallest space."*

---

## IX. Quand le digital rencontre le print

Un produit Stit'Claude moderne peut avoir :
- Une **UI web** responsive pour la création.
- Un **export PDF** propre pour le livrable.
- **Même source** (HTML + CSS Paged Media) = les deux sortent du même pipeline.

C'est la signature d'un designer qui sait faire les deux supports.

**Outils de pipeline moderne :**
- **MDX** + Paged.js → PDF + web depuis même source.
- **Typst** → PDF seulement, mais avec composition rapide comme un browser.
- **LaTeX** → PDF seulement, pour documents formels / réglementaires.

**La règle finale :** si le livrable sera imprimé, **teste-le imprimé**. Un design qui marche à l'écran peut échouer sur papier (contraste, lisibilité, pagination).
