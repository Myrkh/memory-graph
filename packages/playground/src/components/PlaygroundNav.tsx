export interface PlaygroundPage {
  hash: string;
  label: string;
  sub: string;
}

export const PLAYGROUND_PAGES: PlaygroundPage[] = [
  { hash: '01-permanent', label: 'Permanent', sub: 'default · armed at rest' },
  { hash: '02-ghost', label: 'Ghost', sub: 'hover-reveal only' },
  { hash: '03-none', label: 'None', sub: 'no handle · custom trigger' },
];

export interface PlaygroundNavProps {
  current: string;
}

export function PlaygroundNav({ current }: PlaygroundNavProps) {
  return (
    <nav className="pg-nav" aria-label="Playground variants">
      <div className="pg-nav__kicker">Handle variant</div>
      <div className="pg-nav__row">
        {PLAYGROUND_PAGES.map((p) => {
          const active = p.hash === current;
          return (
            <a
              key={p.hash}
              href={`#${p.hash}`}
              className={active ? 'pg-nav__item pg-nav__item--active' : 'pg-nav__item'}
              aria-current={active ? 'page' : undefined}
            >
              <span className="pg-nav__label">{p.label}</span>
              <span className="pg-nav__sub">{p.sub}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
