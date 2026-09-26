import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { createRequire } from 'node:module';
import path from 'node:path';
const dir=path.resolve('node_modules/.cache/audio-check');fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'package.json'),'{"type":"commonjs"}');
for(const name of ['audio','soundscape'])fs.writeFileSync(path.join(dir,name+'.js'),ts.transpileModule(fs.readFileSync(`src/linen/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText);
const require=createRequire(import.meta.url), {windowMix,soundLayer}=require(path.join(dir,'soundscape.js'));
const closed=windowMix(0),open=windowMix(32);
assert.ok(open.wind/closed.wind>20 && open.city/closed.city>8);
assert.ok(open.cutoff/closed.cutoff>10);
let prior=closed;
for(let angle=1;angle<=32;angle++){const next=windowMix(angle);for(const k of ['wind','city','cutoff'])assert.ok(next[k]>prior[k]);prior=next;}
for(const kind of ['wind','city']){
 const data=soundLayer(kind,22050);const rms=[];
 for(let second=1;second<28;second++){let sum=0;for(let i=second*22050;i<(second+1)*22050;i++){assert.ok(Number.isFinite(data[0][i])&&Math.abs(data[0][i])<1);sum+=data[0][i]**2;}rms.push(Math.sqrt(sum/22050));}
 assert.ok(Math.max(...rms)/Math.min(...rms)>2,'Ambience must evolve rather than form a constant hiss');
 assert.ok(Math.abs(data[0][0])<.001 && Math.abs(data[0].at(-1))<.001,'Loop boundary should not click');
 assert.notDeepEqual(data[0],data[1],'Stereo channels should differ');
 console.log(kind,'RMS variation',(Math.max(...rms)/Math.min(...rms)).toFixed(2));
}
class Param{value=0;events=[];setTargetAtTime(v,t,c){this.events.push({v,t,c});}cancelAndHoldAtTime(t){this.events=this.events.filter(e=>e.t<t);} }
class Node{gain=new Param();frequency=new Param();Q=new Param();connect(){return this;}disconnect(){}start(){}stop(){this.stopped=true;} }
let ctx;
globalThis.AudioContext=class{currentTime=0;destination={};gains=[];filters=[];sources=[];constructor(){ctx=this;}createGain(){const n=new Node();this.gains.push(n);return n;}createBiquadFilter(){const n=new Node();this.filters.push(n);return n;}createBuffer(){return {copyToChannel(){}};}createBufferSource(){const n=new Node();this.sources.push(n);return n;}resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}close(){return Promise.resolve();}};
const {LinenAudio}=require(path.join(dir,'audio.js'));const audio=new LinenAudio();audio.setOpening(0);await audio.setEnabled(true);
assert.equal(ctx.gains[1].gain.events.at(-1).v,closed.wind);
audio.setOpening(32);assert.equal(ctx.gains[1].gain.events.at(-1).v,open.wind);assert.equal(ctx.gains[2].gain.events.at(-1).v,0,'City ambience stays intentionally muted');
audio.breeze();audio.setOpening(0);
assert.equal(ctx.gains[1].gain.events.length,1,'Closing must cancel future gust gain changes');assert.equal(ctx.gains[1].gain.events[0].v,closed.wind);
await audio.setEnabled(false);assert.equal(ctx.gains[0].gain.events.at(-1).v,0);
audio.dispose();assert.ok(ctx.sources.every(s=>s.stopped));
console.log('Opening, muffling, gust cancellation, mute, and disposal passed.');

const hiddenAudio=new LinenAudio();hiddenAudio.setHidden(true);await hiddenAudio.setEnabled(true);
assert.equal(ctx.state,'suspended','Enabling sound in Work must not start room ambience');
hiddenAudio.setHidden(false);assert.equal(ctx.state,'running','Returning Home should resume enabled ambience');hiddenAudio.dispose();
console.log('Hidden-view startup and return passed.');
