import { soundLayer, windowMix } from './soundscape';

/** Separate gust and traffic beds, acoustically occluded by the casement. */
export class LinenAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private wind: GainNode | null = null;
  private city: GainNode | null = null;
  private occlusion: BiquadFilterNode | null = null;
  private sources: AudioBufferSourceNode[] = [];
  private enabled = false;
  private hidden = false;
  private opening = 18;

  setOpening(opening: number) { this.opening=opening;this.updateMix(); }

  private updateMix() {
    if(!this.context||!this.wind||!this.city||!this.occlusion)return;
    const mix=windowMix(this.opening), now=this.context.currentTime;
    for(const param of [this.wind.gain,this.city.gain,this.occlusion.frequency])param.cancelAndHoldAtTime(now);
    this.wind.gain.setTargetAtTime(mix.wind,now,.3);
    this.city.gain.setTargetAtTime(0,now,.3);
    this.occlusion.frequency.setTargetAtTime(mix.cutoff,now,.3);
  }

  async setEnabled(enabled: boolean) {
    if(!enabled&&!this.context)return;
    if(!this.context){
      this.context=new AudioContext();
      this.master=this.context.createGain();this.master.gain.value=0;this.master.connect(this.context.destination);
      this.occlusion=this.context.createBiquadFilter();this.occlusion.type='lowpass';this.occlusion.Q.value=.5;this.occlusion.connect(this.master);
      this.wind=this.context.createGain();this.city=this.context.createGain();
      this.wind.gain.value=0;this.city.gain.value=0;
      this.wind.connect(this.occlusion);this.city.connect(this.occlusion);
      for(const kind of ['wind','city'] as const){
        // 22.05 kHz is sufficient for distant outdoor ambience and keeps startup small.
        const rate=22050, data=soundLayer(kind,rate,kind==='wind'?29:37);
        const buffer=this.context.createBuffer(2,data[0].length,rate);
        data.forEach((channel,index)=>buffer.copyToChannel(channel,index));
        const source=this.context.createBufferSource();source.buffer=buffer;source.loop=true;
        source.connect(kind==='wind'?this.wind:this.city);source.start();this.sources.push(source);
      }
      this.updateMix();
    }
    if(this.hidden)await this.context.suspend();
    else if(enabled)await this.context.resume();
    this.enabled=enabled;
    this.master!.gain.setTargetAtTime(enabled?.25:0,this.context.currentTime,.4);
  }

  breeze() {
    if(!this.context||!this.wind||!this.enabled||this.opening===0)return;
    const now=this.context.currentTime, level=windowMix(this.opening).wind;
    this.wind.gain.cancelAndHoldAtTime(now);
    this.wind.gain.setTargetAtTime(level*1.45,now,.35);
    this.wind.gain.setTargetAtTime(level,now+1.1,1.2);
  }

  chime() {
    const context=this.context;
    if(!context||!this.enabled||this.hidden||!this.master)return;
    const osc=context.createOscillator(), gain=context.createGain(), now=context.currentTime;
    osc.frequency.setValueAtTime(380,now);osc.frequency.exponentialRampToValueAtTime(182,now+.12);
    gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.009,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+.11);
    osc.connect(gain).connect(this.master);osc.start(now);osc.stop(now+.14);
    osc.onended=()=>{osc.disconnect();gain.disconnect();};
  }

  setHidden(hidden: boolean) {
    this.hidden=hidden;
    if(!this.context)return;
    if(hidden)void this.context.suspend().catch(()=>{});
    else if(this.enabled)void this.context.resume().catch(()=>{});
  }

  dispose() {
    for(const source of this.sources){source.stop();source.disconnect();}
    this.sources=[];void this.context?.close();
    this.context=null;this.master=null;this.wind=null;this.city=null;this.occlusion=null;
  }
}
