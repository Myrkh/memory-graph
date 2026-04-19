import type { ReactNode } from 'react';
import { MemoryGraph } from '@stitclaude/memory-graph';
import { useMemoryGraphContext } from '@stitclaude/memory-graph';

/**
 * Shared essay content for every playground variant page. The 3 pages only
 * differ in how they expose the panel trigger (Handle variant, custom
 * button, keyboard only) — the reading experience stays the same so the
 * visual comparison is honest.
 */

export const DEMO_PARAGRAPHS: Array<{ id: string; lead?: boolean; text: string }> = [
  {
    id: 'intro',
    lead: true,
    text: 'Reading is not scrolling. Reading is when the eye slows enough that a sentence can land, be weighed, be absorbed. The memory graph is a portrait of that slowing — a still life of where you lingered, where you looped, where you came back.',
  },
  {
    id: 'dwell',
    text: 'A paragraph only becomes a node when you have lingered on it for three full seconds. Below that, it is just a passage — a moment crossed, not inhabited. The threshold is the tariff of signal-over-noise.',
  },
  {
    id: 'return',
    text: 'Return edges are the most interesting marks. They record the moment you came back — either to re-read, to re-check, or because the thought looped back to an earlier idea. The graph draws loops as curved arcs so you can read them as loops.',
  },
  {
    id: 'graph',
    text: 'The graph itself stays still. Position is not decorative; it is memory. The node up and to the left is the node up and to the left — not wherever the force-layout pushes it today. Stability is what makes a graph legible.',
  },
  {
    id: 'local',
    text: 'Nothing leaves the device. The graph is a journal the reader keeps by accident, stored in localStorage under a key derived from the URL. Your reading belongs to you — the library is a lens, not a pipe.',
  },
];

export interface DemoEssayProps {
  /** Small uppercase mono text shown above the title (variant name). */
  kicker: string;
  /** Optional slot rendered below the deck, before the essay itself. */
  aside?: ReactNode;
}

export function DemoEssay({ kicker, aside }: DemoEssayProps) {
  return (
    <div className="demo-wrap">
      <header className="demo-intro">
        <div className="demo-kicker">
          <span>—</span>
          <span>{kicker}</span>
          <span>—</span>
        </div>
        <h1 className="demo-title">
          Read <em>slowly</em>. The graph remembers.
        </h1>
        <p className="demo-deck">
          Dwell on a paragraph for <strong>3&nbsp;s</strong> and it becomes a station.
          Scroll past one quickly and it becomes a passage.
        </p>
        {aside ? <div className="demo-aside">{aside}</div> : null}
      </header>

      <MemoryGraph.Zone as="article" className="demo-essay">
        {DEMO_PARAGRAPHS.map((p) => (
          <MemoryGraph.Paragraph
            key={p.id}
            id={p.id}
            className={p.lead === true ? 'demo-p demo-p--lead' : 'demo-p'}
          >
            {p.text}
          </MemoryGraph.Paragraph>
        ))}
      </MemoryGraph.Zone>
    </div>
  );
}

/**
 * Panel + all chrome. Identical for every variant page — only the trigger
 * mechanism (Handle variant, custom button, …) changes at the page level.
 */
export function DemoPanel() {
  return (
    <>
      <MemoryGraph.Backdrop />
      <MemoryGraph.Panel>
        <MemoryGraph.Head>
          <MemoryGraph.TitleRow>
            <MemoryGraph.Title>
              Memory <em>Graph</em>
            </MemoryGraph.Title>
            <MemoryGraph.CloseButton />
          </MemoryGraph.TitleRow>
          <MemoryGraph.Stats />
        </MemoryGraph.Head>
        <MemoryGraph.DeepestIndicator />
        <GraphOrEmpty />
        <MemoryGraph.IntensitySparkline />
        <MemoryGraph.Footer>
          <MemoryGraph.FooterGroup>
            <MemoryGraph.ClearButton
              onBeforeClear={() => window.confirm('Clear your memory graph for this page?')}
            />
            <MemoryGraph.ExportButton />
          </MemoryGraph.FooterGroup>
          <MemoryGraph.FooterGroup>
            <MemoryGraph.PassagesToggle />
          </MemoryGraph.FooterGroup>
        </MemoryGraph.Footer>
      </MemoryGraph.Panel>
      <MemoryGraph.SelectionToolbar />
      <MemoryGraph.PinToast />
      <MemoryGraph.Tooltip />
      <MemoryGraph.KeyboardShortcuts />
    </>
  );
}

function GraphOrEmpty() {
  const { derived, showPassages, state } = useMemoryGraphContext();
  const hasContent = derived.stationCount > 0 || (showPassages && state.passages.size > 0);
  if (!hasContent) return <MemoryGraph.Empty />;
  return <MemoryGraph.Graph />;
}
