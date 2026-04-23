/**
 * Background service worker (MV3, non-persistent).
 *
 * v0.3.0 step 3b · owns the unified super-state. Content scripts send
 * `content/commit` messages with a dwell + metadata ; the worker reads
 * the current graph from storage, applies the commit via the lib's pure
 * `applyCommit` helper, and writes the new graph back. `chrome.storage.
 * onChanged` fires in every listening context automatically, so the
 * side panel picks up the update without extra plumbing.
 *
 * Commits are serialized through a tiny promise chain to avoid the
 * read-modify-write race when multiple tabs commit simultaneously.
 */

import { applyCommit } from '@myrkh/memory-graph';
import { readGraph, writeGraph } from './storage.js';
import type { ExtensionMessage, ExtensionResponse } from '../shared/messages.js';

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[memory-graph] installed', details.reason, details.previousVersion);
});

// Toolbar icon click → side panel opens directly (no popup intermediate).
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((err) => console.warn('[memory-graph] sidePanel.setPanelBehavior', err));

/**
 * Commits are applied sequentially to prevent the lost-update pattern
 * (two simultaneous read-modify-write cycles stomping each other). The
 * chain lives on `globalThis` so it survives between message dispatches
 * while the worker is alive.
 */
let commitChain: Promise<void> = Promise.resolve();

async function handleCommit(
  commit: Extract<ExtensionMessage, { type: 'content/commit' }>['commit'],
): Promise<void> {
  const current = await readGraph();
  const next = applyCommit(current, {
    paraId: commit.paraId,
    dwellMs: commit.dwellMs,
    textContent: commit.textContent,
    kind: commit.kind,
    route: commit.route,
    site: commit.site,
    now: commit.now,
  });
  await writeGraph(next);
}

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (res: ExtensionResponse) => void,
  ): boolean => {
    switch (message.type) {
      case 'content/ready': {
        console.log(
          '[memory-graph] content ready',
          message.site.origin,
          message.site.pathname,
          'tab',
          sender.tab?.id,
        );
        sendResponse({ ok: true, ack: 'content/ready' });
        return false;
      }
      case 'content/commit': {
        commitChain = commitChain
          .then(() => handleCommit(message.commit))
          .catch((err) => {
            console.warn('[memory-graph] commit apply failed', err);
          });
        // Don't block the sender — commit is fire-and-forget.
        sendResponse({ ok: true, ack: 'content/commit' });
        return false;
      }
      case 'panel/ready': {
        readGraph()
          .then((graph) => sendResponse({ ok: true, ack: 'panel/ready', graph }))
          .catch((err) =>
            sendResponse({ ok: false, error: err instanceof Error ? err.message : String(err) }),
          );
        return true; // async response
      }
      case 'ping': {
        sendResponse({ ok: true, ack: 'pong' });
        return false;
      }
      default: {
        sendResponse({ ok: false, error: 'unknown message type' });
        return false;
      }
    }
  },
);
