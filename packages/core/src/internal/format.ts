/**
 * Internal formatters shared by primitives.
 * Not exported on the public API — these are implementation details.
 */

export interface FormattedDuration {
  /** Integer part — "0", "42", "3 30" (min sec). */
  value: string;
  /** Unit label — "s", "m", "ms". */
  unit: string;
  /** Second unit when the value has minutes+seconds. */
  secondUnit?: string;
}

/**
 * Format a millisecond duration for the compact stats display.
 * Mirrors the vanilla `formatDuration` but returns structured parts instead
 * of HTML so React can render each span safely.
 *
 * - `ms < 1000` → `"0 s"`
 * - `ms < 60_000` → `"<sec> s"`
 * - else → `"<min> m <rem> s"` (with remainder)
 */
export function formatDuration(ms: number): FormattedDuration {
  if (ms < 1000) return { value: '0', unit: 's' };
  const sec = Math.round(ms / 1000);
  if (sec < 60) return { value: String(sec), unit: 's' };
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return { value: `${min}`, unit: 'm', secondUnit: ` ${rem}s` };
}
