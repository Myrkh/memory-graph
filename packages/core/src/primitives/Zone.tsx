import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ElementType,
  type ReactNode,
  type Ref,
} from 'react';
import { useMemoryGraphContext } from './context.js';

export interface ZoneProps {
  /** Element rendered as the scroll container. Defaults to `article`. */
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/**
 * Scroll container whose descendant `[data-mg-id]` elements are observed.
 * Must be rendered inside `<MemoryGraph.Root>`. Ref is shared with the root
 * context so the attention tracker knows what to observe.
 *
 * Also wires the article-to-graph side of Innovation 02 (bidirectional
 * hover): a delegated mouseover/mouseout listener resolves the nearest
 * `[data-mg-id]` ancestor and updates `hoveredNodeId` on context.
 */
export const Zone = forwardRef<HTMLElement, ZoneProps>(function Zone(
  props,
  forwardedRef,
) {
  const { as: Tag = 'article', className, children } = props;
  const { zoneRef, currentParaId, hoveredNodeId, setHoveredNode, open } =
    useMemoryGraphContext();

  const localRef = useRef<HTMLElement | null>(null);
  const setRef = (node: HTMLElement | null): void => {
    localRef.current = node;
    (zoneRef as unknown as { current: HTMLElement | null }).current = node;
  };

  useImperativeHandle<HTMLElement | null, HTMLElement | null>(
    forwardedRef as Ref<HTMLElement | null>,
    () => localRef.current,
    [],
  );

  /* -- Article → graph hover bridge ----------------------------------- */

  const setHoveredNodeRef = useRef(setHoveredNode);
  setHoveredNodeRef.current = setHoveredNode;
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    const zone = localRef.current;
    if (!zone) return;

    const resolveId = (target: EventTarget | null): string | null => {
      if (!(target instanceof Element)) return null;
      const mg = target.closest('[data-mg-id]');
      if (!mg || !zone.contains(mg)) return null;
      return mg instanceof HTMLElement ? mg.dataset.mgId ?? null : null;
    };

    const onOver = (e: MouseEvent): void => {
      if (!openRef.current) return;
      const id = resolveId(e.target);
      if (id) setHoveredNodeRef.current(id);
    };

    const onOut = (e: MouseEvent): void => {
      const from = resolveId(e.target);
      if (!from) return;
      const related = e.relatedTarget;
      if (related instanceof Node) {
        const toId = resolveId(related);
        if (toId === from) return;
      }
      setHoveredNodeRef.current(null);
    };

    zone.addEventListener('mouseover', onOver);
    zone.addEventListener('mouseout', onOut);
    return () => {
      zone.removeEventListener('mouseover', onOver);
      zone.removeEventListener('mouseout', onOut);
    };
  }, []);

  /* -- Mirror hoveredNodeId onto the matching paragraph's DOM --------- */

  useEffect(() => {
    const zone = localRef.current;
    if (!zone) return;
    const previous = zone.querySelectorAll<HTMLElement>('[data-mg-id][data-mg-highlight]');
    previous.forEach((el) => el.removeAttribute('data-mg-highlight'));
    if (hoveredNodeId) {
      const next = zone.querySelector<HTMLElement>(
        `[data-mg-id="${CSS.escape(hoveredNodeId)}"]`,
      );
      next?.setAttribute('data-mg-highlight', '');
    }
  }, [hoveredNodeId]);

  const currentAttr = currentParaId ? { 'data-mg-current': currentParaId } : {};

  return (
    <Tag
      ref={setRef}
      className={className}
      data-mg-zone
      {...currentAttr}
    >
      {children}
    </Tag>
  );
});
