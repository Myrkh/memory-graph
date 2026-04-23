/**
 * Typed message protocol between the extension contexts.
 *
 * Three senders can talk to the service worker :
 *   · content scripts (tracker commits, ready heartbeat)
 *   · the side panel (ping, future: request a state snapshot)
 *   · the worker itself (internal self-message for scheduled tasks)
 *
 * All messages are discriminated unions on `type`. Responses are also
 * typed so `chrome.runtime.sendMessage<Msg, Res>` stays end-to-end safe.
 *
 * Storage reads and writes do NOT go through this protocol — they go
 * straight to `chrome.storage.local` from any context via the adapter
 * in `background/storage.ts`. Messages are reserved for scenarios where
 * one context must *notify* another of something outside storage.
 */

import type { NodeKind, SerializedGraph } from '@myrkh/memory-graph';

export interface SiteInfo {
  /** Origin of the site where the content script is running (e.g. "https://github.com"). */
  origin: string;
  /** Pathname of the current document (e.g. "/Myrkh/memory-graph"). */
  pathname: string;
  /** Document title at the time the message was sent. */
  title: string;
}

/** A single dwell commit captured by the content-script tracker. */
export interface CommitPayload {
  paraId: string;
  dwellMs: number;
  /** Plain-text excerpt, capped on the sender to keep messages small. */
  textContent: string;
  kind: NodeKind;
  /** Full `route` string stored on the node (`site.pathname` in v0.3.0). */
  route: string;
  /** Origin of the site the commit came from — becomes a site-tag later. */
  site: string;
  /** Epoch ms the dwell closed. */
  now: number;
}

export type ExtensionMessage =
  | { type: 'content/ready'; site: SiteInfo }
  | { type: 'content/commit'; commit: CommitPayload }
  | { type: 'panel/ready' }
  | { type: 'ping' };

export interface ExtensionResponse {
  ok: boolean;
  ack?: string;
  error?: string;
  graph?: SerializedGraph | null;
}
