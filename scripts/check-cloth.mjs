import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const source = fs.readFileSync('src/linen/cloth.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
const directory = path.resolve('node_modules/.cache/linen-check');
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, 'package.json'), '{"type":"commonjs"}');
fs.writeFileSync(path.join(directory, 'cloth.js'), compiled.outputText);
const require = createRequire(import.meta.url);
const { LinenCloth, COLUMNS, ROWS, TOP } = require(path.join(directory, 'cloth.js'));
const open = new LinenCloth(1);
const closed = new LinenCloth(1);
const center = (ROWS * (COLUMNS + 1) + Math.floor(COLUMNS / 2)) * 3;
const heights = [];
for (let step = 0; step < 1200; step++) {
  open.advance(1 / 60, 18);
  closed.advance(1 / 60, 0);
  if (step > 600) heights.push(open.positions[center + 2]);
}
const excursion = Math.max(...heights) - Math.min(...heights);
assert.ok(excursion > .025, `Idle wind should produce continuing billow, got ${excursion}`);
assert.ok(open.positions[center + 2] > closed.positions[center + 2] + .12, 'Open casement must drive materially more billow than a closed window');
for (let col = 0; col <= COLUMNS; col++) {
  assert.equal(open.positions[col * 3], open.rest[col * 3], 'Heading x anchor drift');
  assert.equal(open.positions[col * 3 + 1], open.rest[col * 3 + 1], 'Heading y anchor drift');
  assert.equal(open.positions[col * 3 + 2], open.rest[col * 3 + 2], 'Heading z anchor drift');
}
// Pull far beyond the normal pointer reach, release, and run with maximum wind.
open.grab = { index: ROWS * (COLUMNS + 1) + 4, x: -100, y: 100, z: 100 };
for (let step = 0; step < 60; step++) open.advance(1 / 60, 32);
open.grab = null;open.breathe();
for (let step = 0; step < 900; step++) open.advance(1 / 60, 32);
for (let i = 0; i < open.positions.length; i += 3) {
  assert.ok(Number.isFinite(open.positions[i]) && Number.isFinite(open.positions[i + 1]) && Number.isFinite(open.positions[i + 2]), 'Nonfinite cloth state');
  assert.ok(Math.abs(open.positions[i]) <= 2.21, 'Cloth escaped scene horizontally');
  assert.ok(open.positions[i + 1] >= -1.56 && open.positions[i + 1] <= TOP + .031, 'Cloth escaped vertical bounds');
  assert.ok(open.positions[i + 2] >= .269 && open.positions[i + 2] <= 2.001, 'Cloth escaped depth bounds');
}
const lengths = open.constraints.filter(c => c.stiffness > .9).map(c => {
  const a=c.a*3,b=c.b*3,p=open.positions;
  return Math.hypot(p[a]-p[b],p[a+1]-p[b+1],p[a+2]-p[b+2])/c.rest;
});
assert.ok(Math.max(...lengths) < 1.18, 'Cloth remains over-stretched after release');
console.log(JSON.stringify({ idleBillowRange: excursion.toFixed(3), openDepth: open.positions[center+2].toFixed(3), closedDepth: closed.positions[center+2].toFixed(3), maxEdgeStretch: Math.max(...lengths).toFixed(3), pinnedHeading: 'stable', dragRecovery: 'finite and bounded' }, null, 2));

// 120 Hz rendering should move between 60 Hz physics updates, without overshoot.
const smooth = new LinenCloth(1);
for(let i=0;i<180;i++) smooth.advance(1/60,18);
const before = new Float32Array(smooth.positions.length);
const between = new Float32Array(smooth.positions.length);
smooth.interpolate(before);
smooth.advance(1/120,18);
smooth.interpolate(between);
assert.ok(between.some((v,i)=>Math.abs(v-before[i])>1e-6), 'Half-step render should advance smoothly');
for(let i=0;i<between.length;i++) {
  assert.ok(between[i]>=Math.min(smooth.previous[i],smooth.positions[i])-1e-6 && between[i]<=Math.max(smooth.previous[i],smooth.positions[i])+1e-6, 'Interpolation overshoot');
}
console.log('120 Hz interpolation: continuous and bounded');
