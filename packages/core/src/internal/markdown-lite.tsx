/**
 * Minimal inline markdown parser for annotation notes.
 *
 * Supports only `*italic*` and `**bold**`. All other characters are
 * treated as plain text. No block-level syntax, no links, no images — on
 * purpose (spec §03: "no more").
 *
 * Implemented as an iterative O(n) single-pass walk, never using regex
 * backtracking or recursion — so unterminated sequences typed in real
 * time (e.g. the user is mid-way through `**bold`) can never freeze the
 * page. Nested markers are not supported: whichever marker opens first
 * wins, and any stray `*` inside is rendered as a literal.
 */

import { Fragment, type ReactNode } from 'react';

type Segment =
  | { kind: 'text'; text: string }
  | { kind: 'italic'; text: string }
  | { kind: 'bold'; text: string };

/**
 * Render a markdown-lite string as React children. Never throws, never
 * emits raw HTML, always terminates in O(n).
 */
export function renderMarkdownLite(input: string): ReactNode {
  if (!input) return null;
  const segments = parseSegments(input);
  return segments.map((seg, i) => {
    const key = `md-${i}`;
    if (seg.kind === 'text') return <Fragment key={key}>{seg.text}</Fragment>;
    if (seg.kind === 'bold') return <strong key={key}>{seg.text}</strong>;
    return <em key={key}>{seg.text}</em>;
  });
}

function parseSegments(input: string): Segment[] {
  const out: Segment[] = [];
  const len = input.length;
  let cursor = 0;
  let buffer = '';

  const flushBuffer = (): void => {
    if (buffer.length > 0) {
      out.push({ kind: 'text', text: buffer });
      buffer = '';
    }
  };

  while (cursor < len) {
    const ch = input[cursor];

    // **bold** — matched only when a closing `**` exists later in the string.
    if (ch === '*' && input[cursor + 1] === '*') {
      const close = input.indexOf('**', cursor + 2);
      if (close !== -1 && close > cursor + 2) {
        const inner = input.slice(cursor + 2, close);
        if (inner.length > 0) {
          flushBuffer();
          out.push({ kind: 'bold', text: inner });
          cursor = close + 2;
          continue;
        }
      }
    }

    // *italic* — single-star pair with non-empty, non-star inner text.
    if (ch === '*') {
      const close = input.indexOf('*', cursor + 1);
      if (close !== -1 && close > cursor + 1) {
        const inner = input.slice(cursor + 1, close);
        if (inner.length > 0 && !inner.includes('*')) {
          flushBuffer();
          out.push({ kind: 'italic', text: inner });
          cursor = close + 1;
          continue;
        }
      }
    }

    buffer += ch;
    cursor += 1;
  }

  flushBuffer();
  return out;
}
