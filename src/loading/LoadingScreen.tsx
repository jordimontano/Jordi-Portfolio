import { useEffect, useRef, useState } from 'react';
import '@fontsource/pixelify-sans/latin-400.css';
import { BondType } from './engine';
import './loading.css';

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => {
      const restoreFocus = document.activeElement === skip.current;
      onComplete();
      if (restoreFocus) requestAnimationFrame(() => document.getElementById('main-content')?.focus({ preventScroll: true }));
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500);
    return () => clearTimeout(timer);
  }, [leaving, onComplete]);

  useEffect(() => {
    const element = canvas.current;
    if (!element || leaving) return;
    let disposed = false;
    let engine: BondType | undefined;
    let onScreen = true;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let stillTimer = 0;
    let finished = false;
    const deadline = performance.now() + 6500;
    const finish = () => {
      if (disposed || finished) return;
      finished = true;
      setLeaving(true);
    };
    // Keep the deadline active after the canvas starts: hidden tabs and stalled frames
    // may never call the engine's completion callback.
    const fallback = window.setTimeout(finish, 6500);
    const fontTimeout = window.setTimeout(() => { if (!engine) finish(); }, 1800);
    const sync = () => {
      clearTimeout(stillTimer);
      if (finished) return;
      if (performance.now() >= deadline) { finish(); return; }
      if (!engine) return;
      if (preference.matches) {
        engine.stop();
        engine.renderStill();
        if (!document.hidden && onScreen) stillTimer = window.setTimeout(finish, 650);
      } else if (document.hidden || !onScreen) engine.stop();
      else engine.start();
    };
    const observer = new ResizeObserver(() => engine?.resize());
    observer.observe(element);
    const intersection = new IntersectionObserver(entries => {
      onScreen = entries[0]?.isIntersecting ?? false;
      sync();
    });
    intersection.observe(element);
    document.addEventListener('visibilitychange', sync);
    preference.addEventListener('change', sync);
    void document.fonts.load('400 48px "Pixelify Sans"', 'Jordi Montano').then(() => {
      if (disposed || finished) return;
      if (performance.now() >= deadline) { finish(); return; }
      engine = new BondType(element, '"Pixelify Sans"', finish);
      if (!engine.ok) { finish(); return; }
      clearTimeout(fontTimeout);
      setPainted(true);
      sync();
    }).catch(finish);
    return () => {
      disposed = true;
      clearTimeout(fallback);
      clearTimeout(fontTimeout);
      clearTimeout(stillTimer);
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', sync);
      preference.removeEventListener('change', sync);
      engine?.destroy();
    };
  }, [leaving]);

  return <div className={`loading-screen${leaving ? ' is-leaving' : ''}`}>
    <div className="loading-name" role="img" aria-label="Jordi Montano">
      {!painted && <span className="loading-name-fallback" aria-hidden="true">Jordi<br />Montano</span>}
      <canvas ref={canvas} aria-hidden="true" />
    </div>
    <span className="sr-only" role="status">Opening Jordi Montano’s portfolio.</span>
    <button ref={skip} className="loading-skip" onClick={() => setLeaving(true)}>Skip intro</button>
  </div>;
}
