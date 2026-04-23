/**
 * Theme-swap icon · the v0.3.0 signature for the Chrome extension's
 * theme shop trigger. Composition by the user :
 *
 *   · central hollow ring          — "the reader" / hub
 *   · 4 cardinal ticks (low-op)    — latent spokes (4-fold symmetric)
 *   · 2 dashed arcs from TL & BR to center  — active connections
 *   · 2 hollow rings at TL + BR    — current theme's endpoints
 *   · 2 filled dots at TR + BL     — candidate (deactivated) endpoints
 *
 * Hover animation : the whole icon rotates 90° clockwise via
 * `--mg-ease-expo-out` 280ms. Because ticks + center are rotationally
 * symmetric, only the 4-corner set appears to swap diagonals — the
 * user's *"lines travelling from one end to the other"* intuition,
 * materialised. Poetic because the active theme literally SHIFTS onto
 * the previously-latent diagonal — *"picking the other option"*.
 */

export function ThemeSwapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mg-icon mg-icon--theme-swap"
      aria-hidden
      focusable="false"
    >
      {/* One group · rotates in unison on hover, creating the diagonal
       * swap without individual element animation. */}
      <g className="mg-icon__swap-group">
        {/* Central hollow ring · the hub. */}
        <circle className="mg-icon__hub" cx={12} cy={12} r={2.5} />

        {/* 4 cardinal ticks · latent structure, low-op. */}
        <g className="mg-icon__ticks">
          <path d="M 12 5 V 7" />
          <path d="M 12 17 V 19" />
          <path d="M 5 12 H 7" />
          <path d="M 17 12 H 19" />
        </g>

        {/* Active diagonal · dashed arcs curving into the hub. */}
        <path className="mg-icon__arc" d="M 7 7 C 8 6 10 5.2 12 5.2" />
        <path className="mg-icon__arc" d="M 17 17 C 16 18 14 18.8 12 18.8" />

        {/* Endpoints of the active diagonal · hollow rings. */}
        <circle className="mg-icon__endpoint" cx={7} cy={7} r={1.4} />
        <circle className="mg-icon__endpoint" cx={17} cy={17} r={1.4} />

        {/* Candidates on the dormant diagonal · filled dots. */}
        <circle className="mg-icon__candidate" cx={17} cy={7} r={1.1} />
        <circle className="mg-icon__candidate" cx={7} cy={17} r={1.1} />
      </g>
    </svg>
  );
}
