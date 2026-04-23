import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

export interface TypewriterTab {
  /** Unique identifier — typically a site origin or workspace id. */
  id: string;
  /** 1-2 char initial / glyph rendered in the tile. */
  label: string;
  /** Full name surfaced in the hover tooltip (e.g. "github.com"). */
  fullName?: string;
}

export interface TypewriterTabsProps {
  tabs: TypewriterTab[];
  /** `null` = the "all" tab is active. */
  currentId: string | null;
  onChange: (id: string | null) => void;
  /** Render the ∑ all tab at the far right. Default `true`. */
  showAllTab?: boolean;
  /** Label in the ∑ tile. Default `'∑'`. */
  allLabel?: string;
  /** Tooltip for the ∑ tile. Default `'All sites'`. */
  allFullName?: string;
  className?: string;
  style?: CSSProperties;
}

const BAR_WIDTH = 20;
const ALL_TAB_ID = '__mg_all__';

/**
 * Typewriter tabs · the site switcher for the Chrome extension sidePanel
 * and any multi-bucket memory-graph consumer. Hairline 32×32 squircles
 * with Fraunces-italic letter-initials and a coral baseline bar that
 * **glides** between active tiles. When the tabs list reorders (recent
 * sites glide left), the tiles animate via FLIP so the move reads as
 * motion instead of a jump.
 *
 * Design references :
 *   · Brief V0.3.0-BRIEF.md · "Typewriter tabs — schéma détaillé"
 *   · Motion tokens : `--mg-duration-moderate` + `--mg-ease-expo-out`
 *   · Grammar : hairline border, dashed baseline, coral accent only
 */
export function TypewriterTabs(props: TypewriterTabsProps) {
  const {
    tabs,
    currentId,
    onChange,
    showAllTab = true,
    allLabel = '∑',
    allFullName = 'All sites',
    className,
    style,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [barLeft, setBarLeft] = useState(0);
  const [barVisible, setBarVisible] = useState(false);

  // -- Coral bar positioning ---------------------------------------------
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      setBarVisible(false);
      return;
    }
    const active = container.querySelector<HTMLElement>(
      '[data-mg-tab-active="true"]',
    );
    if (!active) {
      setBarVisible(false);
      return;
    }
    setBarLeft(active.offsetLeft + (active.offsetWidth - BAR_WIDTH) / 2);
    setBarVisible(true);
  }, [currentId, tabs, showAllTab]);

  // -- FLIP reorder · tiles glide to their new position when the tabs
  // list re-sorts (e.g. most-recent-activity bubbles a site to the left).
  // First/Last/Invert/Play : capture current offsetLeft, diff against the
  // previous one from the ref, translate back to the old spot with no
  // transition, then play back to 0 with the standard motion tokens.
  const prevPositions = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tiles = container.querySelectorAll<HTMLElement>('[data-mg-tab-id]');
    const nextPositions = new Map<string, number>();
    for (const tile of tiles) {
      const id = tile.dataset['mgTabId'];
      if (!id) continue;
      const current = tile.offsetLeft;
      nextPositions.set(id, current);
      const prev = prevPositions.current.get(id);
      if (reduced || prev === undefined || prev === current) continue;
      const delta = prev - current;
      // First/Invert · land at the old position instantly.
      tile.style.transition = 'none';
      tile.style.transform = `translateX(${delta}px)`;
      // Force reflow before swapping transition back on — without it
      // the browser collapses the two style mutations into one frame
      // and the animation never plays.
      void tile.offsetWidth;
      // Play · animate to identity with the standard tokens.
      tile.style.transition =
        'transform var(--mg-duration-moderate, 280ms) var(--mg-ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1))';
      tile.style.transform = '';
    }
    prevPositions.current = nextPositions;
  }, [tabs, showAllTab]);

  const base = className ? `mg-tabs ${className}` : 'mg-tabs';

  return (
    <div className={base} style={style} role="tablist" ref={containerRef}>
      <span className="mg-tabs__baseline" aria-hidden />
      {tabs.map((tab) => (
        <TileButton
          key={tab.id}
          tabId={tab.id}
          label={tab.label}
          fullName={tab.fullName ?? tab.id}
          active={tab.id === currentId}
          onClick={() => onChange(tab.id)}
        />
      ))}
      {showAllTab ? (
        <>
          <span className="mg-tabs__divider" aria-hidden />
          <TileButton
            tabId={ALL_TAB_ID}
            label={allLabel}
            fullName={allFullName}
            active={currentId === null}
            onClick={() => onChange(null)}
            isAll
          />
        </>
      ) : null}
      <span
        className="mg-tabs__bar"
        aria-hidden
        style={{ transform: `translateX(${barLeft}px)` }}
        data-mg-visible={barVisible ? '' : undefined}
      />
    </div>
  );
}

interface TileButtonProps {
  tabId: string;
  label: string;
  fullName: string;
  active: boolean;
  onClick: () => void;
  isAll?: boolean;
}

function TileButton(props: TileButtonProps) {
  const { tabId, label, fullName, active, onClick, isAll } = props;
  const cls = isAll ? 'mg-tabs__tile mg-tabs__tile--all' : 'mg-tabs__tile';
  return (
    <button
      type="button"
      className={cls}
      data-mg-tab-id={tabId}
      data-mg-tab-active={active}
      aria-pressed={active}
      aria-label={fullName}
      onClick={onClick}
    >
      <span className="mg-tabs__letter" aria-hidden>
        {label}
      </span>
      <span className="mg-tabs__tip" aria-hidden>
        {fullName}
      </span>
    </button>
  );
}
