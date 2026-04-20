/* Data model + config ---------------------------------------------------- */
export * from './types.js';

/* Hooks ------------------------------------------------------------------- */
export { useMemoryGraphState } from './hooks/useMemoryGraphState.js';
export type {
  MemoryGraphActions,
  MemoryGraphDerived,
  UseMemoryGraphStateReturn,
} from './hooks/useMemoryGraphState.js';

export { usePersistence } from './hooks/usePersistence.js';
export type { ExportMeta, UsePersistenceReturn } from './hooks/usePersistence.js';

export { useAttentionTracker } from './hooks/useAttentionTracker.js';
export type {
  UseAttentionTrackerOptions,
  UseAttentionTrackerReturn,
} from './hooks/useAttentionTracker.js';

export { useMemoryGraphHover } from './hooks/useMemoryGraphHover.js';
export type { UseMemoryGraphHoverReturn } from './hooks/useMemoryGraphHover.js';

export { useTextSelection } from './hooks/useTextSelection.js';
export type {
  ResolvedSelection,
  UseTextSelectionOptions,
} from './hooks/useTextSelection.js';

export { useFocusTrap } from './hooks/useFocusTrap.js';

/* Primitives — named exports + compound namespace ------------------------- */
import * as MemoryGraph from './primitives/index.js';
export { MemoryGraph };
export * from './primitives/index.js';
