import { useState } from 'react';

export default function IsleroShowcase() {
  const [night, setNight] = useState(false);
  const [litReady, setLitReady] = useState(false);
  const [unlitReady, setUnlitReady] = useState(false);

  return <>
    <p className="project-status">As of September 2026, we’re profitable and the business has doubled each month since launch.</p>
    <p className="islero-authorship">I built the agency website and the client websites featured within it.</p>
    <a className="text-link islero-site-link" href="https://isleroagency.com/" target="_blank" rel="noreferrer">Visit Islero Agency<img className="islero-link-mascot" src="/images/islero/isli.png" alt="" aria-hidden="true" width="256" height="256"/></a>

    <section className="islero-showcase" aria-label="Islero website highlights">
      <figure className="islero-feature">
        <div className="islero-preview-toolbar">
          <span>La Isla</span>
          <div className="islero-preview-switch" role="group" aria-label="Landing page appearance">
            <button type="button" aria-pressed={!night} aria-controls="islero-landing-preview" onClick={() => setNight(false)}>Day</button>
            <button type="button" aria-pressed={night} aria-controls="islero-landing-preview" onClick={() => setNight(true)}>Night</button>
          </div>
        </div>
        <div id="islero-landing-preview" className="islero-landing-preview" data-night={night}>
          <img src="/images/islero/landing-day.jpg" alt={night ? '' : 'Islero’s landing page with a floating tropical island, illustrated clouds, and a yellow wordmark'} aria-hidden={night} width="1440" height="1000" loading="lazy"/>
          <div className="islero-night-scene" aria-hidden={!night} data-ready={litReady && unlitReady}>
            <img src="/images/islero/landing-night-unlit.jpg" alt="" width="1440" height="1000" loading="lazy" onLoad={() => setUnlitReady(true)}/>
            <img className="islero-cabin-lit" src="/images/islero/landing-night.jpg" alt={night ? 'The same island at night, with stars, a crescent moon, and warm light from the cabin' : ''} width="1440" height="1000" loading="lazy" onLoad={() => setLitReady(true)}/>
          </div>
        </div>
        <figcaption><h2>An island of our own.</h2><p>The landing page brings La Isla to life with drifting clouds, a floating island, and an optional soundscape. Switch the preview between day and night to see how the scene changes.</p></figcaption>
      </figure>
      <figure className="islero-feature">
        <img className="islero-archive-preview" src="/images/islero/work-archive.jpg" alt="Islero’s interactive work archive, with projects arranged around a curved carousel" width="1440" height="1000" loading="lazy"/>
        <figcaption><h2>A different way to explore the work.</h2><p>A curved carousel lets visitors move through projects by scrolling, dragging, or using the arrow keys. Each project opens into its own case study.</p><a className="text-link" href="https://isleroagency.com/work" target="_blank" rel="noreferrer">Explore the archive</a></figcaption>
      </figure>
    </section>
  </>;
}
