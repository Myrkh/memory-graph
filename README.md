# @stitclaude/memory-graph

**Visualisez vos trails de lecture comme un vrai graphe de mémoire interactif.**

Une librairie React + TypeScript ultra-moderne qui transforme n’importe quel contenu textuel (articles, essais, livres numériques…) en **node-link graph vivant** : chaque paragraphe devient un nœud, chaque transition d’attention devient une arête.

Portage officiel React du composant vanilla « memory-graph » avec une API composée, des hooks puissants et une expérience utilisateur pensée pour les lecteurs intensifs.

![Memory Graph Demo](https://via.placeholder.com/800x400/1a1a2e/00ffcc?text=Memory+Graph+Live+Demo)  
*(Remplace par une vraie capture ou GIF du playground une fois que tu en auras une)*

## ✨ Fonctionnalités

- **Composants composés** (`MemoryGraph.Root`, `MemoryGraph.Graph`, `MemoryGraph.Zone`, etc.) → API ultra-flexible et accessible
- **Persistence automatique** via `localStorage` (restauration instantanée)
- **Attention Tracker** en temps réel (suit où vous lisez)
- **Hover bidirectionnel** (paragraphe ↔ nœud)
- **Annotations track + linking mode** (innovation 2025)
- **Note editor** intégré
- **Flash + toast** pour les transitions fluides
- **Thèmes** (StitClaude inclus + facile à étendre)
- **Keyboard shortcuts** + `Tooltip` + `SelectionToolbar`
- **Zero-dependency** côté runtime (seulement React 18+ en peer)
- **Fully typed** + tests Vitest

## 🚀 Installation

```bash
# Avec pnpm (recommandé)
pnpm add @stitclaude/memory-graph

# Ou npm / yarn
npm install @stitclaude/memory-graph
# yarn add @stitclaude/memory-graph

📦 Import
import { MemoryGraph } from '@stitclaude/memory-graph';
import '@stitclaude/memory-graph/styles';                    // styles de base
import '@stitclaude/memory-graph/themes/stit-claude';       // thème par défaut
🧩 Usage rapide
tsximport { MemoryGraph } from '@stitclaude/memory-graph';

function App() {
  return (
    <MemoryGraph.Root
      storageKey="my-essay-v1"           // clé unique pour la persistence
      config={{
        // overrides optionnels
      }}
      defaultOpen={true}
    >
      {/* Votre contenu de lecture ici */}
      <div className="prose max-w-none">
        {/* Tous les paragraphes avec data-mg-paragraph-id */}
        <p data-mg-paragraph-id="p1">Premier paragraphe...</p>
        <p data-mg-paragraph-id="p2">Deuxième paragraphe...</p>
        {/* ... */}
      </div>

      {/* Le graphe lui-même */}
      <MemoryGraph.Graph />

      {/* Optionnels mais puissants */}
      <MemoryGraph.Panel>
        <MemoryGraph.Head />
        <MemoryGraph.Stats />
        <MemoryGraph.AnnotationsTrack />
      </MemoryGraph.Panel>

      <MemoryGraph.PinToast />
      <MemoryGraph.KeyboardShortcuts />
    </MemoryGraph.Root>
  );
}
Astuce : chaque paragraphe doit avoir l’attribut data-mg-paragraph-id (géré automatiquement par useAttentionTracker).
📚 API complète
Composants principaux (namespace MemoryGraph.)




























































ComposantRôleProps importantesRootConteneur + state + contextstorageKey, config, openGraphLe vrai SVG node-link—ZoneZone de lecture (attention tracking)—PanelPanneau latéral—HandlePoignée pour ouvrir/fermer—Head / TitleEn-tête du panneau—StatsStatistiques de lecture—AnnotationsTrackColonne des annotations—NoteEditorÉditeur de notes par nœud—TooltipTooltip sur les nœuds—
Tous les composants sont fully typed. Tu peux explorer les types avec MemoryGraph. dans ton IDE.
Hooks exposés

useMemoryGraphState() → état complet + actions
usePersistence() → export / clear / restore
useAttentionTracker() → suit la lecture en temps réel
useMemoryGraphHover() → hover synchronisé
useTextSelection() → toolbar de sélection intelligente

🎨 Thèmes & Styles
tsx// Thème par défaut (StitClaude)
import '@stitclaude/memory-graph/themes/stit-claude';
Tu peux créer ton propre thème en important ./dist/styles/themes/mon-theme.css ou en surchargeant les variables CSS.
🛠️ Développement
Bash# Depuis la racine du monorepo
pnpm install

# Développement du core
cd packages/core
pnpm dev

# Playground (démo live)
cd packages/playground
pnpm dev
Build :
Bashpnpm --filter @stitclaude/memory-graph build
📄 Licence
MIT © Myrkh
🔗 Liens

Playground (démo)
Issues
Roadmap
Made with ❤️ pour les lecteurs qui pensent en graphes.