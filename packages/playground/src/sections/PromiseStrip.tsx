export function PromiseStrip() {
  return (
    <section className="site-promise" aria-label="What memory-graph promises">
      <ul className="site-promise__list">
        <li className="site-promise__item site-reveal" data-mg-id="home-promise-01">
          <span className="site-promise__num">01</span>
          <span className="site-promise__text">
            <strong>Wrap once.</strong> Mark anything. <em>Any</em> React app.
          </span>
        </li>
        <li className="site-promise__item site-reveal" data-mg-id="home-promise-02">
          <span className="site-promise__num">02</span>
          <span className="site-promise__text">
            <strong>Semantic HTML is the hint.</strong> Buttons click, inputs
            focus, text reads — zero annotation for the common case.
          </span>
        </li>
        <li className="site-promise__item site-reveal" data-mg-id="home-promise-03">
          <span className="site-promise__num">03</span>
          <span className="site-promise__text">
            <strong>Zero network.</strong> Everything lives in{' '}
            <code>localStorage</code>. No analytics. No surveillance.
          </span>
        </li>
      </ul>
    </section>
  );
}
