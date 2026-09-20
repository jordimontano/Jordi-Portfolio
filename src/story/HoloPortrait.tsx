import { useEffect, useRef } from 'react';
import './holo.css';

// Adapted from the supplied Holo reference: independently eased tilt and foil.
export default function HoloPortrait() {
  const hostRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current, card = cardRef.current;
    if (!host || !card) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let aim = { x: -.22, y: -.16 };
    const tilt = { x: 0, y: 0 }, foil = { x: 0, y: 0 };
    function paint() {
      if (!card) return;
      frame = 0;
      tilt.x += (aim.x - tilt.x) * .16;
      tilt.y += (aim.y - tilt.y) * .16;
      foil.x += (tilt.x - foil.x) * .09;
      foil.y += (tilt.y - foil.y) * .09;
      const off = Math.min(1, Math.hypot(foil.x, foil.y));
      const style = card.style;
      style.setProperty('--rx', `${-tilt.y * 14}deg`);
      style.setProperty('--ry', `${tilt.x * 14}deg`);
      style.setProperty('--fx', `${50 + foil.x * 26}%`);
      style.setProperty('--fy', `${50 + foil.y * 26}%`);
      style.setProperty('--gx', `${50 + tilt.x * 38}%`);
      style.setProperty('--gy', `${50 + tilt.y * 38}%`);
      style.setProperty('--foil', `${.26 + off * .5}`);
      style.setProperty('--reveal', `${Math.max(0, (off - .34) / .66)}`);
      style.setProperty('--flip', `${Math.max(0, (off - .52) / .48)}`);
      if (Math.abs(aim.x - foil.x) + Math.abs(aim.y - foil.y) > .001) frame = requestAnimationFrame(paint);
    }
    const wake = () => { if (!frame && !reduced.matches) frame = requestAnimationFrame(paint); };
    const move = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      aim = { x: Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)), y: Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1)) };
      wake();
    };
    const reset = () => { aim = { x: -.22, y: -.16 }; wake(); };
    const motionChange = () => {
      cancelAnimationFrame(frame); frame = 0;
      if (reduced.matches) card.removeAttribute('style'); else wake();
    };
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', reset);
    reduced.addEventListener('change', motionChange);
    wake();
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', reset);
      reduced.removeEventListener('change', motionChange);
    };
  }, []);

  return <div className="holo-host" ref={hostRef}>
    <div className="holo-card" ref={cardRef} role="img" aria-label="Jordi Montano. Babson College 27'">
      <div className="holo-foil" aria-hidden="true"/>
      <div className="holo-lines" aria-hidden="true"/>
      <div className="holo-content" aria-hidden="true">
        <div className="holo-text"><span className="holo-name">Jordi Montano</span><span className="holo-caption">Babson College 27'</span></div>
        <div className="holo-photo">
          <img src="/images/jordi-portrait.jpg" alt="" width="675" height="900" draggable={false}/>
          <img className="holo-photo-negative" src="/images/jordi-portrait.jpg" alt="" width="675" height="900" draggable={false}/>
        </div>
      </div>
      <div className="holo-glare" aria-hidden="true"/>
    </div>
  </div>;
}
