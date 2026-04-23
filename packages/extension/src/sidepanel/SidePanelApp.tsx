import { useEffect, useMemo, useState } from 'react';
import {
  MemoryGraph,
  type TypewriterTab,
  useMemoryGraphContext,
} from '@myrkh/memory-graph';
import { createChromeStorageAdapter } from '../shared/chrome-storage-adapter.js';
import { useThemePreference } from '../shared/use-theme-preference.js';
import { ThemeShop } from './ThemeShop.js';
import { BottomDrawer } from './BottomDrawer.js';
import { useActiveTabRoute } from './use-active-tab-route.js';

/**
 * Side panel root · uses the canonical `<StandardBody>` from the lib,
 * persistence fed by `chromeStorageAdapter`. The content-script React
 * app running in the host page uses the SAME adapter with the SAME key,
 * so both instances share one source of truth — annotations created on
 * the page appear in the side panel instantly, and vice-versa.
 *
 * Live route feed · `useActiveTabRoute()` streams the active tab's
 * `pathname` so the Graph's 2D column layout can light up the current
 * route in coral, exactly like the playground does with its own
 * `location.pathname`.
 */
export function SidePanelApp() {
  const adapter = useMemo(() => createChromeStorageAdapter(), []);
  const [shopOpen, setShopOpen] = useState(false);
  const activeRoute = useActiveTabRoute();
  const [theme, setTheme] = useThemePreference();

  return (
    <div data-mg-theme={theme} className="mgx-theme-root">
      <MemoryGraph.Root
        className="mgx-root"
        storageKey="mg-ext:session"
        open={true}
        persistenceAdapter={adapter}
        {...(activeRoute.pathname ? { route: activeRoute.pathname } : {})}
      >
        <div className="mgx-panel">
          <PanelBody
            onOpenShop={() => setShopOpen(true)}
            activeOrigin={activeRoute.origin}
          />
          <MemoryGraph.AnnotationsTrack />
        </div>
        <MemoryGraph.Tooltip />
        <ThemeShop
          open={shopOpen}
          onClose={() => setShopOpen(false)}
          currentTheme={theme}
          onPickTheme={setTheme}
        />
      </MemoryGraph.Root>
    </div>
  );
}

/**
 * Separate inner component so we can use `useMemoryGraphContext()` to
 * derive the tabs list from the live graph state. Must sit *inside*
 * `<Root>`, hence the split.
 */
function PanelBody({
  onOpenShop,
  activeOrigin,
}: {
  onOpenShop: () => void;
  activeOrigin: string | null;
}) {
  const { state } = useMemoryGraphContext();
  const tabs = useSiteTabs(state.nodes);
  const [currentSite, setCurrentSite] = useState<string | null>(null);
  const [userPickedSite, setUserPickedSite] = useState(false);

  // Auto-follow the active Chrome tab until the user manually picks a
  // tab in the TypewriterTabs strip. Once they do, we stop overriding
  // their choice (otherwise flipping Chrome tabs would yank the view
  // out from under them). The `∑ all` bubble also counts as a manual
  // pick, so auto-follow stops there too.
  useEffect(() => {
    if (userPickedSite) return;
    setCurrentSite(activeOrigin);
  }, [activeOrigin, userPickedSite]);

  const pickSite = (next: string | null): void => {
    setUserPickedSite(true);
    setCurrentSite(next);
  };

  const hasTabs = tabs.length > 0;

  // When the ∑ all tab is active (currentSite === null), swap the
  // default Graph slot for <Constellation>. The super-node click
  // callback sets currentSite → bounces back to per-site view.
  const graphOverride =
    currentSite === null && hasTabs ? (
      <MemoryGraph.Constellation onSiteClick={pickSite} />
    ) : undefined;

  return (
    <>
      <MemoryGraph.StandardBody
        topSlot={
          hasTabs ? (
            <MemoryGraph.TypewriterTabs
              tabs={tabs}
              currentId={currentSite}
              onChange={pickSite}
            />
          ) : null
        }
        titleActions={
          <>
            <MemoryGraph.AnnotationsTrackToggle />
            <button
              type="button"
              className="mg-panel-title-action"
              onClick={onOpenShop}
              aria-label="Open theme shop"
              title="Theme shop"
            >
              <MemoryGraph.ThemeSwapIcon />
            </button>
          </>
        }
        {...(currentSite !== null ? { site: currentSite } : {})}
        {...(graphOverride ? { graphOverride } : {})}
        bottomOverride={null}
      />
      <BottomDrawer label="Sparkline + panel actions">
        <MemoryGraph.IntensitySparkline />
        <MemoryGraph.Footer>
          <MemoryGraph.FooterGroup>
            <MemoryGraph.ClearButton
              onBeforeClear={() =>
                window.confirm(
                  'Clear your unified memory graph across all sites?',
                )
              }
            />
            <MemoryGraph.ExportButton />
          </MemoryGraph.FooterGroup>
          <MemoryGraph.FooterGroup>
            <MemoryGraph.PassagesToggle />
          </MemoryGraph.FooterGroup>
        </MemoryGraph.Footer>
      </BottomDrawer>
    </>
  );
}

function useSiteTabs(
  nodes: Map<string, { site?: string; firstAt: number }>,
): TypewriterTab[] {
  return useMemo(() => {
    const perSite = new Map<string, { latest: number }>();
    for (const node of nodes.values()) {
      if (!node.site) continue;
      const prev = perSite.get(node.site);
      if (!prev || node.firstAt > prev.latest) {
        perSite.set(node.site, { latest: node.firstAt });
      }
    }
    const sorted = [...perSite.entries()].sort(
      (a, b) => b[1].latest - a[1].latest,
    );
    return sorted.map(([site]) => {
      const host = hostFromOrigin(site);
      return {
        id: site,
        label: (host[0] ?? '·').toUpperCase(),
        fullName: host,
      };
    });
  }, [nodes]);
}

function hostFromOrigin(origin: string): string {
  try {
    return new URL(origin).host;
  } catch {
    return origin;
  }
}
