import { useEffect, useRef, useState } from 'react';
import type { SceneControls, createLinenScene } from './scene';
import './linen.css';
import { LinenAudio } from './audio';
import '@fontsource/caveat/latin-400.css';

export default function LinenWindow({ paused, opening, onOpeningChange, onBreeze }: { paused: boolean; opening: number; onOpeningChange: (value: number) => void; onBreeze?: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<ReturnType<typeof createLinenScene> | null>(null);
  const audio = useRef<LinenAudio | null>(null);
  const devParameters = import.meta.env.DEV ? new URLSearchParams(location.search) : null;
  const controls = useRef<SceneControls>({ paused, opening: 18, reducedMotion: devParameters?.get('motion') === 'reduce' });
  const forceFallback = devParameters?.get('webgl') === 'off';
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(!!forceFallback);
  const [reduced, setReduced] = useState(() => controls.current.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(controls.current.reducedMotion || preference.matches);
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    let disposed = false;
    if (forceFallback) return;
    void import('./scene').then(({ createLinenScene }) => {
      if (disposed || !canvas.current) return;
      try {
        scene.current = createLinenScene(canvas.current, controls.current);
        setReady(true);
      } catch {
        setFailed(true);
      }
    }).catch(() => { if (!disposed) setFailed(true); });
    return () => { disposed = true;scene.current?.dispose();scene.current = null; };
  }, [forceFallback]);

  useEffect(() => {
    const ambience = new LinenAudio();
    audio.current = ambience;
    const syncVisibility = () => ambience.setHidden(document.hidden || controls.current.paused);
    const activate = (event: Event) => {
      if (!event.isTrusted || controls.current.paused || document.hidden) return;
      void ambience.setEnabled(true).catch(() => {});
    };
    syncVisibility();
    document.addEventListener('pointerdown', activate);
    document.addEventListener('keydown', activate);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      document.removeEventListener('pointerdown', activate);
      document.removeEventListener('keydown', activate);
      document.removeEventListener('visibilitychange', syncVisibility);
      ambience.dispose();
      audio.current = null;
    };
  }, []);

  useEffect(() => {controls.current.paused = paused;scene.current?.wake();audio.current?.setHidden(paused || document.hidden);}, [paused]);
  useEffect(() => {controls.current.opening = opening;scene.current?.wake();audio.current?.setOpening(opening);}, [opening]);

  function breeze() { scene.current?.breeze();audio.current?.breeze();onBreeze?.(); }

  return (
    <div className="linen-experience">
      <div className={`linen-stage ${ready ? 'is-ready' : ''} ${failed ? 'has-fallback' : ''}`}>
        {!failed && <canvas
          ref={canvas}
          tabIndex={0}
          role="img"
          aria-label="Sunlight through linen curtains. A brass pole is mounted above a slightly open window. Drag the cloth, or press Space for a breeze."
          onKeyDown={event => {if ((event.key === ' ' || event.key === 'Enter') && !paused && !reduced) {event.preventDefault();breeze();}}}
        />}
        {failed && <div className="linen-fallback" role="img" aria-label="Still illustration of an open sunlit window with softly folded linen curtains"><div className="still-window" /><div className="still-rod" /><div className="still-curtain still-curtain--left" /><div className="still-curtain still-curtain--right" /></div>}
        {!ready && !failed && <p className="scene-loading" role="status">Letting the light in<span>…</span></p>}
        {ready && !failed && !reduced && <p className="linen-drag-hint">drag the<br className="linen-hint-break"/> curtain<svg viewBox="0 0 104 12" fill="none" aria-hidden="true"><path d="M3 7C25 2 60 3 100 5M12 10C40 6 69 7 88 8"/></svg></p>}
      </div>
      <div className="linen-controls">
        <div className="opening-control">
          <label htmlFor="window-opening">Adjust window</label>
          <input id="window-opening" type="range" min="0" max="32" step="1" value={opening} disabled={failed || !ready} aria-valuetext={`${opening} degrees open`} onChange={event => onOpeningChange(Number(event.target.value))} />
        </div>
        <button className="breeze-button" onClick={breeze} disabled={paused || reduced || failed || !ready}>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M3 8h11c4 0 4-5 1-5-2 0-2 1-2 1M2 12h17c4 0 4 6 0 6-2 0-2-1-2-1M5 16h5c4 0 4 5 1 5" /></svg>
          A little breeze
        </button>
      </div>
      {(failed || reduced) && <p className="linen-instructions">{failed ? 'A still moment. The live scene needs WebGL.' : 'A still moment, for your reduced-motion preference.'}</p>}
    </div>
  );
}
