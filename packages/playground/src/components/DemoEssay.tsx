import type { ReactNode } from 'react';
import { MemoryGraph } from '@myrkh/memory-graph';

/**
 * Shared essay content for every playground variant page.
 *
 * Demonstrates that memory-graph tracks **any block element** carrying
 * `data-mg-id`, not just `<p>` — h1/h2 titles, pull-quotes, asides,
 * code blocks, lists, and figures are all first-class stations.
 */

export interface DemoEssayProps {
  kicker: string;
  aside?: ReactNode;
}

export function DemoEssay({ kicker, aside }: DemoEssayProps) {
  return (
    <div className="demo-wrap">
      <MemoryGraph.Zone as="article" className="demo-essay">
        <header className="demo-hero">
          <div className="demo-kicker">
            <span>—</span>
            <span>{kicker}</span>
            <span>—</span>
          </div>

          <h1 data-mg-id="hero-title" className="demo-title">
            On the Shape of <em>Return</em>
          </h1>

          <p data-mg-id="hero-deck" className="demo-deck">
            Reading is not a straight line from beginning to end. It loops,
            stalls, rewinds. This is a small instrument for making those loops
            visible — without ever looking over your shoulder.
          </p>

          <p className="demo-byline">
            by <strong>Stit'Claude</strong> · April 2026 · <span data-mg-id="hero-meta">an essay on attention</span>
          </p>

          {aside ? <div className="demo-aside-slot">{aside}</div> : null}
        </header>

        <hr className="demo-rule" aria-hidden />

        {/* § 1 ---------------------------------------------------------- */}
        <section className="demo-section">
          <h2 data-mg-id="s1-title" className="demo-section-title">
            <span className="demo-section-num">§ 1</span> Reading is not scrolling
          </h2>
          <MemoryGraph.Paragraph id="s1-p1">
            Reading is what happens when the eye slows enough that a sentence
            can land, be weighed, be absorbed. Scrolling is the opposite — it
            is the eye rehearsing its own speed, checking the page for
            terrain, the way a hiker scouts a trail before committing to a
            step. Both are useful. But only one of them lays down memory.
          </MemoryGraph.Paragraph>
          <MemoryGraph.Paragraph id="s1-p2">
            The web has spent twenty years optimizing for scrolling. Infinite
            feeds, lazy loading, engagement time, bounce rate. All of these
            reward motion over stillness. Memory-graph rewards the opposite:
            the moment your eye stops.
          </MemoryGraph.Paragraph>
          <blockquote data-mg-id="s1-quote" className="demo-quote">
            The question is not how fast you can read, but how long you can hold.
            <cite>Robin Sloan · Notes on Cranky</cite>
          </blockquote>
        </section>

        {/* § 2 ---------------------------------------------------------- */}
        <section className="demo-section">
          <h2 data-mg-id="s2-title" className="demo-section-title">
            <span className="demo-section-num">§ 2</span> The tariff
          </h2>
          <MemoryGraph.Paragraph id="s2-p1">
            A paragraph only becomes a node when you have lingered on it for
            three full seconds. Below that threshold, it is recorded as a
            passage — a moment crossed, not inhabited. Three seconds is not
            arbitrary: it is calibrated against skim velocity, the minimum
            dwell at which comprehension becomes statistically probable.
          </MemoryGraph.Paragraph>

          <aside data-mg-id="s2-aside" className="demo-callout">
            <div className="demo-callout-kicker">Four calibrated numbers</div>
            <ul className="demo-callout-list">
              <li><code>DWELL_MS = 3000</code> — promotion to station</li>
              <li><code>BAND_RATIO = 0.40</code> — attention detection band</li>
              <li><code>RETURN_BEND = 70</code> — signature curve offset</li>
              <li><code>FLASH_MS = 1800</code> — eye-settling time</li>
            </ul>
            <p>Every other value in the component is a default. These four are not.</p>
          </aside>

          <MemoryGraph.Paragraph id="s2-p2">
            You can treat the threshold as a tariff: the fee attention pays
            to enter a moment of record. Without a tariff, every scroll
            produces noise. Three seconds is low enough that reading feels
            effortless, high enough that skimming produces nothing.
          </MemoryGraph.Paragraph>

          <pre data-mg-id="s2-code" className="demo-code">
            <code>{`const CONFIG = {
  DWELL_MS: 3000,    // promotion to station
  BAND_RATIO: 0.4,   // attention detection band
  RETURN_BEND: 70,   // signature curve
  FLASH_MS: 1800,    // eye-settling time
};`}</code>
          </pre>
        </section>

        {/* § 3 ---------------------------------------------------------- */}
        <section className="demo-section">
          <h2 data-mg-id="s3-title" className="demo-section-title">
            <span className="demo-section-num">§ 3</span> Stations and passages
          </h2>
          <MemoryGraph.Paragraph id="s3-p1">
            A station is a paragraph that held your attention. A passage is a
            paragraph you crossed. The graph draws stations as discs whose
            size reflects cumulative dwell. Passages are small dots, visible
            only when you ask for them.
          </MemoryGraph.Paragraph>
          <MemoryGraph.Paragraph id="s3-p2">
            This asymmetry matters. Stations are the paragraphs you read.
            Passages are the paragraphs you saw. A graph that mixed them
            indiscriminately would be a graph of motion, not of reading. By
            keeping them separate — and hiding passages by default — the
            graph stays a portrait of attention, not a transcript of scrolling.
          </MemoryGraph.Paragraph>

          <figure data-mg-id="s3-figure" className="demo-figure">
            <svg viewBox="0 0 320 120" role="img" aria-label="Station versus passage, visually">
              <circle cx="90" cy="60" r="26" className="demo-figure-station" />
              <text x="90" y="100" className="demo-figure-label">station · dwell ≥ 3s</text>
              <circle cx="230" cy="60" r="4" className="demo-figure-passage" />
              <text x="230" y="100" className="demo-figure-label">passage · crossed</text>
            </svg>
            <figcaption>
              A station earns its size from dwell time. A passage stays small and faint — a witness, not a landmark.
            </figcaption>
          </figure>
        </section>

        {/* § 4 ---------------------------------------------------------- */}
        <section className="demo-section">
          <h2 data-mg-id="s4-title" className="demo-section-title">
            <span className="demo-section-num">§ 4</span> The return edge
          </h2>
          <MemoryGraph.Paragraph id="s4-p1">
            The most interesting marks on a memory graph are its return edges:
            the curved arcs that appear when you go back to a paragraph you
            have already read. A forward edge tells you nothing you didn't
            already know — it merely traces the order of first encounters. A
            return edge tells you that something pulled you back.
          </MemoryGraph.Paragraph>
          <MemoryGraph.Paragraph id="s4-p2">
            Return edges curve right. This is a signature — a visual tic the
            component refuses to negotiate. Cubic Bézier, control point at
            max of the two endpoints plus seventy pixels. Changing the
            seventy breaks the recognition.
          </MemoryGraph.Paragraph>

          <blockquote data-mg-id="s4-quote" className="demo-quote demo-quote--pull">
            A forward edge is the path. A return edge is the thought.
          </blockquote>
        </section>

        {/* § 5 ---------------------------------------------------------- */}
        <section className="demo-section">
          <h2 data-mg-id="s5-title" className="demo-section-title">
            <span className="demo-section-num">§ 5</span> Five laws
          </h2>
          <MemoryGraph.Paragraph id="s5-p1">
            Every feature in memory-graph is judged against five
            non-negotiable laws. An innovation that violates any of them is
            not an innovation; it is a degradation.
          </MemoryGraph.Paragraph>
          <ol data-mg-id="s5-laws" className="demo-list demo-list--numbered">
            <li><strong>Zero network.</strong> All state lives in localStorage. Nothing is ever sent to a server.</li>
            <li><strong>Passive observation.</strong> The component watches silently and responds only to explicit gestures.</li>
            <li><strong>Temporal topology only.</strong> The Y axis is firstAt. Never force-directed, never spatial.</li>
            <li><strong>Return-edges curve right.</strong> The Bézier signature is not negotiable.</li>
            <li><strong>Three-second dwell.</strong> Below this, a paragraph is a passage, not a station.</li>
          </ol>
        </section>

        {/* § 6 ---------------------------------------------------------- */}
        <section className="demo-section">
          <h2 data-mg-id="s6-title" className="demo-section-title">
            <span className="demo-section-num">§ 6</span> What the graph refuses
          </h2>
          <MemoryGraph.Paragraph id="s6-p1">
            The graph refuses as much as it accepts, and the refusals are
            deliberate. It refuses force-directed layouts, because spatial
            stability is what lets you remember where something was. It
            refuses colored nodes by topic, because classifying content is a
            job the component has no business doing.
          </MemoryGraph.Paragraph>
          <MemoryGraph.Paragraph id="s6-p2">
            It refuses exports to Readwise or Notion, because your reading
            belongs to your device. It refuses summarization, because a graph
            that interprets is no longer a mirror. The list is long. The
            graveyard — the ledger of ideas the component will never ship —
            is longer than the list of things it does.
          </MemoryGraph.Paragraph>
          <MemoryGraph.Paragraph id="s6-p3">
            This is the discipline: to say no with conviction so that what
            remains earns its place.
          </MemoryGraph.Paragraph>
        </section>

        {/* § 7 ---------------------------------------------------------- */}
        <section className="demo-section">
          <h2 data-mg-id="s7-title" className="demo-section-title">
            <span className="demo-section-num">§ 7</span> Locality
          </h2>
          <MemoryGraph.Paragraph id="s7-p1">
            Nothing leaves the device. The graph is a journal the reader
            keeps by accident, stored in localStorage under a key derived
            from the URL. There is no account. There are no analytics. There
            is no dashboard a product team consults.
          </MemoryGraph.Paragraph>
          <MemoryGraph.Paragraph id="s7-p2">
            This is not a feature. It is a promise. The moment you add a
            network call, the component becomes something different — an
            observation tool, a telemetry stream, a product of surveillance.
            What memory-graph is, it is on purpose: a mirror that only the
            reader looks into.
          </MemoryGraph.Paragraph>
        </section>

        {/* § 8 — Live demo of the four capture strategies ----------------- */}
        <section className="demo-section">
          <h2 data-mg-id="s8-title" className="demo-section-title">
            <span className="demo-section-num">§ 8</span> Four ways to listen
          </h2>
          <MemoryGraph.Paragraph id="s8-p1">
            Reading is one way to pay attention. But a library that only
            watches paragraphs is a library that only knows how to read.
            Memory-graph accepts four capture strategies — viewport,
            hover, click, focus — and five visual kinds — paragraph,
            heading, kpi, figure, code. Semantic HTML provides the default
            hint for both; any element can override.
          </MemoryGraph.Paragraph>

          <div className="demo-strategies" role="group" aria-label="Strategy samples">
            <button
              type="button"
              data-mg-id="s8-click-sample"
              className="demo-strategy demo-strategy--click"
            >
              <span className="demo-strategy-kicker">click · inferred</span>
              <span className="demo-strategy-label">Button → click</span>
            </button>

            <div
              data-mg-id="s8-hover-sample"
              data-mg-strategy="hover"
              data-mg-kind="kpi"
              data-mg-dwell="1200"
              className="demo-strategy demo-strategy--hover"
            >
              <span className="demo-strategy-kicker">hover · kpi · 1.2s</span>
              <span className="demo-strategy-label">Div → hover + kpi square</span>
            </div>

            <label
              data-mg-id="s8-focus-sample"
              data-mg-strategy="focus"
              data-mg-dwell="1500"
              className="demo-strategy demo-strategy--focus"
            >
              <span className="demo-strategy-kicker">focus · 1.5s</span>
              <input type="text" placeholder="Focus the input…" aria-label="Focus sample" />
            </label>
          </div>
        </section>

        <hr className="demo-rule demo-rule--ornate" aria-hidden />

        <p className="demo-signoff" data-mg-id="signoff">
          Made with deliberate slowness.
        </p>
      </MemoryGraph.Zone>
    </div>
  );
}
