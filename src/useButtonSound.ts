import { useEffect } from 'react';

/** A quiet, short tap, created only after a real user activation. */
export default function useButtonSound() {
  useEffect(() => {
    let context: AudioContext | undefined;
    let disposed = false;
    const play = async (event: MouseEvent) => {
      if (!event.isTrusted || !(event.target instanceof Element)) return;
      const button = event.target.closest('button, [role="button"]');
      if (!button || button.matches(':disabled, [aria-disabled="true"]')) return;
      try {
        context ??= new AudioContext();
        if (context.state === 'suspended') await context.resume();
        if (disposed || context.state !== 'running') return;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const now = context.currentTime;
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(620, now);
        oscillator.frequency.exponentialRampToValueAtTime(260, now + .045);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(.035, now + .003);
        gain.gain.exponentialRampToValueAtTime(.0001, now + .065);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + .075);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      } catch { /* Audio availability must never interrupt a button action. */ }
    };
    document.addEventListener('click', play, true);
    return () => {
      disposed = true;
      document.removeEventListener('click', play, true);
      void context?.close().catch(() => {});
    };
  }, []);
}
