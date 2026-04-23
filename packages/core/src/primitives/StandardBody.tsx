import { type ReactNode } from 'react';
import { useMemoryGraphContext } from './context.js';
import { Head, TitleRow, Title } from './Head.js';
import { Stats } from './Stats.js';
import { DeepestIndicator } from './DeepestIndicator.js';
import { Empty } from './Empty.js';
import { Graph, type GraphProps } from './Graph.js';
import { IntensitySparkline } from './IntensitySparkline.js';
import { Footer, FooterGroup } from './Footer.js';
import {
  ClearButton,
  type ClearButtonProps,
  ExportButton,
  PassagesToggle,
} from './ActionButtons.js';

export interface StandardBodyProps {
  /** Title content rendered inside `<Title>`. Defaults to `Memory <em>Graph</em>`. */
  title?: ReactNode;
  /** Actions rendered in the TitleRow right slot — typically
   * `<AnnotationsTrackToggle />` + `<CloseButton />` in a slide-in
   * panel, `<AnnotationsTrackToggle />` alone in an embedded context. */
  titleActions?: ReactNode;
  /** Optional row rendered ABOVE the Head — used by the extension to
   * host `<TypewriterTabs>`. Empty by default. */
  topSlot?: ReactNode;
  /** Forwarded to `<Graph renderNode>` for custom per-node SVG. */
  renderNode?: GraphProps['renderNode'];
  /** Forwarded to `<Graph renderRouteLabel>`. */
  renderRouteLabel?: GraphProps['renderRouteLabel'];
  /** Forwarded to `<Graph site>` — filters the view to a single site. */
  site?: GraphProps['site'];
  /** Replace the default Graph/Empty slot · used by the extension to
   * render `<Constellation>` when the ∑ all tab is active. */
  graphOverride?: ReactNode;
  /** Replace the default IntensitySparkline + Footer section. Pass
   * `null` to hide entirely (extension moves both inside a bottom
   * drawer to give the graph more vertical breathing room). */
  bottomOverride?: ReactNode | null;
  /** Forwarded to `<ClearButton onBeforeClear>`. */
  onBeforeClear?: ClearButtonProps['onBeforeClear'];
}

/**
 * The canonical composition of every primitive that belongs *inside* a
 * memory-graph panel : Head (TitleRow + Stats), DeepestIndicator, Graph
 * or Empty, IntensitySparkline, Footer (Clear / Export / PassagesToggle).
 *
 * Consumers mount it either wrapped in `<Panel>` for a slide-in
 * experience (what the playground does) OR inline inside any flex
 * container for embedded contexts (what the Chrome extension does in
 * the sidePanel). Slot props let the caller swap the title, inject
 * extra actions, or override `renderNode` without duplicating the
 * composition itself.
 *
 * Single source of truth for the default panel layout — if we later
 * add a new built-in row (e.g. a top toolbar), both playground and
 * extension pick it up at the next lib build.
 */
export function StandardBody(props: StandardBodyProps) {
  const {
    title,
    titleActions,
    topSlot,
    renderNode,
    renderRouteLabel,
    site,
    graphOverride,
    bottomOverride,
    onBeforeClear,
  } = props;

  return (
    <>
      {topSlot}
      <Head>
        <TitleRow>
          <Title>
            {title ?? (
              <>
                Memory <em>Graph</em>
              </>
            )}
          </Title>
          {titleActions ? (
            <div className="mg-panel__title-actions">{titleActions}</div>
          ) : null}
        </TitleRow>
        <Stats />
      </Head>

      <DeepestIndicator />

      {graphOverride ?? (
        <GraphOrEmpty
          {...(renderNode ? { renderNode } : {})}
          {...(renderRouteLabel ? { renderRouteLabel } : {})}
          {...(site !== undefined ? { site } : {})}
        />
      )}

      {bottomOverride !== undefined ? (
        bottomOverride
      ) : (
        <>
          <IntensitySparkline />
          <Footer>
            <FooterGroup>
              <ClearButton {...(onBeforeClear ? { onBeforeClear } : {})} />
              <ExportButton />
            </FooterGroup>
            <FooterGroup>
              <PassagesToggle />
            </FooterGroup>
          </Footer>
        </>
      )}
    </>
  );
}

function GraphOrEmpty(
  props: Pick<GraphProps, 'renderNode' | 'renderRouteLabel' | 'site'>,
) {
  const { derived, showPassages, state } = useMemoryGraphContext();
  const hasContent =
    derived.stationCount > 0 || (showPassages && state.passages.size > 0);
  if (!hasContent) return <Empty />;
  return <Graph {...props} />;
}
