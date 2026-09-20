/** Opening controls both acoustic level and the muffling of the closed glass. */
export function windowMix(degrees: number) {
  const open = Math.max(0, Math.min(1, degrees / 32));
  return { wind: .008 + .22 * open ** .8, city: .025 + .19 * open ** .7, cutoff: 240 + 2960 * open ** .65 };
}

/** Procedural stereo air and passing road traffic; no downloaded recordings. */
export function soundLayer(kind: 'wind' | 'city', sampleRate: number, duration = 29) {
  const length = Math.floor(sampleRate * duration);
  const channels = [new Float32Array(length), new Float32Array(length)];
  let seed = kind === 'wind' ? 1981 : 7751;
  const random = () => {seed = Math.imul(seed,1664525)+1013904223|0;return (seed>>>0)/4294967296*2-1;};
  for(let channel=0;channel<2;channel++) {
    let slow=0, air=0, enginePhase=0;
    for(let i=0;i<length;i++) {
      const t=i/sampleRate, p=2*Math.PI*t/duration;
      const n=random();
      slow += (n-slow) * (1-Math.exp(-2*Math.PI*95/sampleRate));
      air += (n-air) * (1-Math.exp(-2*Math.PI*850/sampleRate));
      const fade=Math.min(1,t/.25,(duration-t)/.25);
      if(kind==='wind') {
        // Unequal, overlapping gusts and changing turbulence; no constant hiss bed.
        const breath=(.5+.5*Math.sin(p*3+.7*Math.sin(p*2)))**2;
        const flutter=.75+.25*Math.sin(p*19+channel*.8);
        channels[channel][i]=(slow*2.1+air*.24*flutter)*(.09+.8*breath)*fade;
      } else {
        const pass=(.5+.5*Math.sin(p*3+channel*.23))**6;
        enginePhase+=2*Math.PI*(74+17*Math.sin(p*3+1.3))/sampleRate;
        const engine=Math.sin(enginePhase)+.25*Math.sin(enginePhase*2)+.08*Math.sin(enginePhase*3);
        channels[channel][i]=(slow*.9*(.2+pass)+air*.13*pass+engine*.033*pass)*fade;
      }
    }
  }
  return channels;
}
