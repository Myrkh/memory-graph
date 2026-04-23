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

export { useViewportStrategy } from './hooks/useViewportStrategy.js';
export type {
  UseViewportStrategyOptions,
  UseViewportStrategyReturn,
} from './hooks/useViewportStrategy.js';

export { useHoverStrategy } from './hooks/useHoverStrategy.js';
export type { UseHoverStrategyOptions } from './hooks/useHoverStrategy.js';

export { useClickStrategy } from './hooks/useClickStrategy.js';
export type { UseClickStrategyOptions } from './hooks/useClickStrategy.js';

export { useFocusStrategy } from './hooks/useFocusStrategy.js';
export type { UseFocusStrategyOptions } from './hooks/useFocusStrategy.js';

export {
  inferStrategy,
  resolveStrategy,
} from './internal/strategy-inference.js';
export type { StrategyInference } from './internal/strategy-inference.js';

export {
  inferKind,
  resolveKind,
} from './internal/kind-inference.js';
export type { KindInference } from './internal/kind-inference.js';

export { useMemoryGraphHover } from './hooks/useMemoryGraphHover.js';
export type { UseMemoryGraphHoverReturn } from './hooks/useMemoryGraphHover.js';

export { useTextSelection } from './hooks/useTextSelection.js';
export type {
  ResolvedSelection,
  UseTextSelectionOptions,
} from './hooks/useTextSelection.js';

export { useFocusTrap } from './hooks/useFocusTrap.js';

/* Runtime-agnostic helpers — for non-React consumers (workers, SSR, Electron) */
export { applyCommit } from './apply-commit.js';
export type { CommitInput } from './apply-commit.js';
export { serializeGraph, deserializeGraph } from './internal/serialize.js';
export type { PersistenceAdapter } from './persistence-adapter.js';
export { createLocalStorageAdapter } from './internal/local-storage-adapter.js';

/* Primitives — named exports + compound namespace ------------------------- */
import * as MemoryGraph from './primitives/index.js';
export { MemoryGraph };
export * from './primitives/index.js';
