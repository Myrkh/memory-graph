import { useEffect } from 'react';
import {
  THEME_CATALOG,
  type ThemeId,
  type ThemeMeta,
} from '../shared/theme-catalog.js';

/**
 * Theme shop · Stit'Claude-signature picker.
 *
 * Each card renders a LIVE mini-panel in the target theme's own tokens
 * by scoping `[data-mg-theme="<id>"]` on its own container. The user
 * sees the actual palette + typography + signature move (washi grain,
 * sun-gradient, pixel grid, ivory accent) *before* applying. Click
 * flips the global theme in `chrome.storage.sync`, both runtimes
 * re-tint in the same frame.
 *
 * Active card carries `data-mg-active` for the coral ring. Fully
 * keyboard-operable. ESC closes the modal.
 *
 * Future : free-card click = apply ; premium-card click = Lemon Squeezy
 * checkout. The `tier` field on the catalog entry already tracks this.
 */

export interface ThemeShopProps {
  open: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onPickTheme: (next: ThemeId) => void;
}

export function ThemeShop(props: ThemeShopProps) {
  const { open, onClose, currentTheme, onPickTheme } = props;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="mgx-shop-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Theme shop"
    >
      <div
        className="mgx-shop"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <header className="mgx-shop__head">
          <div className="mgx-shop__kicker">Memory Graph · Theme shop</div>
          <h2 className="mgx-shop__title">
            Choisis ta <em>maison</em>.
          </h2>
          <p className="mgx-shop__deck">
            Six thèmes, six écoles. Le moteur reste identique — seuls les
            tokens, les polices et les signatures visuelles changent.
          </p>
        </header>

        <div className="mgx-shop__grid" role="list">
          {THEME_CATALOG.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              active={theme.id === currentTheme}
              onPick={() => onPickTheme(theme.id)}
            />
          ))}
        </div>

        <footer className="mgx-shop__foot">
          <button
            type="button"
            className="mgx-shop__close"
            onClick={onClose}
            autoFocus
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

function ThemeCard({
  theme,
  active,
  onPick,
}: {
  theme: ThemeMeta;
  active: boolean;
  onPick: () => void;
}) {
  const activeAttr = active ? { 'data-mg-active': '' } : {};
  return (
    <button
      type="button"
      className="mgx-shop-card"
      role="listitem"
      aria-pressed={active}
      aria-label={`Apply ${theme.label} theme`}
      onClick={onPick}
      data-mg-theme={theme.id}
      {...activeAttr}
    >
      {/* Live mini-panel — renders inside the card's own theme scope so
       * every token (bg, fg, accent, signature background-image) comes
       * straight from the target theme's CSS. */}
      <div className="mgx-shop-card__preview">
        <div className="mgx-shop-card__preview-title">
          Memory <em>Graph</em>
        </div>
        <div className="mgx-shop-card__preview-stats">
          <span className="mgx-shop-card__preview-stat">12s</span>
          <span className="mgx-shop-card__preview-dot">·</span>
          <span className="mgx-shop-card__preview-stat">4n</span>
        </div>
        <div className="mgx-shop-card__preview-pulse" aria-hidden />
      </div>
      <div className="mgx-shop-card__meta">
        <div className="mgx-shop-card__label-row">
          <span className="mgx-shop-card__label">{theme.label}</span>
          {theme.tier === 'free' ? (
            <span className="mgx-shop-card__badge mgx-shop-card__badge--free">
              free
            </span>
          ) : null}
        </div>
        <div className="mgx-shop-card__house">{theme.house}</div>
        <div className="mgx-shop-card__tagline">{theme.tagline}</div>
      </div>
    </button>
  );
}
