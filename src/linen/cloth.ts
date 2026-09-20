/** A damped, position-based cloth solver. Pinned heading, structural/shear/bend constraints. */
export const COLUMNS = 48;
export const ROWS = 48;
export const TOP = 1.77;
export const LENGTH = 3.14;
export const PANEL_WIDTH = 1.61;
export const BASE_Z = 0.48;
const STRIDE = COLUMNS + 1;
const STEP = 1 / 60;

export type Grab = { index: number; x: number; y: number; z: number };
type Constraint = { a: number; b: number; rest: number; stiffness: number };

export class LinenCloth {
  readonly positions = new Float32Array(STRIDE * (ROWS + 1) * 3);
  readonly previous = new Float32Array(this.positions.length);
  readonly rest = new Float32Array(this.positions.length);
  readonly inverseMass = new Float32Array(STRIDE * (ROWS + 1));
  readonly constraints: Constraint[] = [];
  grab: Grab | null = null;
  private accumulator = 0;
  private time = 0;
  private gust = 0;

  constructor(readonly side: -1 | 1) {
    for (let row = 0; row <= ROWS; row++) {
      const v = row / ROWS;
      for (let col = 0; col <= COLUMNS; col++) {
        const u = col / COLUMNS;
        const index = row * STRIDE + col;
        const i = index * 3;
        const fold = Math.cos(u * Math.PI * 12 + Math.sin(u * 17) * .16 + v * v * .6 * Math.sin(u * 8 + v * 3 + side)) * (.9 + .1 * Math.cos(u * 7 + side));
        const x = side === -1 ? -1.70 + u * PANEL_WIDTH : .09 + u * PANEL_WIDTH;
        this.positions[i] = x + side * .035 * v * v + .025 * v * Math.sin(v * 5 + u * 4 + side);
        this.positions[i + 1] = TOP - v * LENGTH + .009 * Math.cos(u * Math.PI * 12) * v;
        this.positions[i + 2] = BASE_Z + fold * (.067 + v * .065) + .08 * Math.sin(v * 4 + u * 3) * v;
        this.inverseMass[index] = row === 0 ? 0 : 1;
      }
    }
    this.previous.set(this.positions);
    this.rest.set(this.positions);
    const connect = (a: number, b: number, stiffness: number) => {
      const ia = a * 3, ib = b * 3;
      const rest = Math.hypot(this.rest[ia] - this.rest[ib], this.rest[ia + 1] - this.rest[ib + 1], this.rest[ia + 2] - this.rest[ib + 2]);
      this.constraints.push({ a, b, rest, stiffness });
    };
    for (let row = 0; row <= ROWS; row++) {
      for (let col = 0; col <= COLUMNS; col++) {
        const a = row * STRIDE + col;
        if (col < COLUMNS) connect(a, a + 1, .94);
        if (row < ROWS) connect(a, a + STRIDE, .98);
        if (col < COLUMNS && row < ROWS) {
          connect(a, a + STRIDE + 1, .32);
          connect(a + 1, a + STRIDE, .32);
        }
        if (col < COLUMNS - 1) connect(a, a + 2, .10);
        if (row < ROWS - 1) connect(a, a + STRIDE * 2, .12);
      }
    }
  }

  breathe() { this.gust = 1; }

  advance(delta: number, opening: number) {
    this.accumulator += Math.min(delta, .05);
    let steps = 0;
    while (this.accumulator >= STEP && steps < 3) {
      this.step(STEP, opening);
      this.accumulator -= STEP;
      steps++;
    }
  }

  /** Smooth display motion between fixed physics steps without changing the solver. */
  interpolate(target: Float32Array) {
    const alpha = Math.min(1, this.accumulator / STEP);
    for (let i = 0; i < target.length; i++) {
      target[i] = this.previous[i] + (this.positions[i] - this.previous[i]) * alpha;
    }
  }

  private step(dt: number, opening: number) {
    this.time += dt;
    this.gust *= Math.exp(-dt * .65);
    const p = this.positions, previous = this.previous;
    const air = Math.max(0, Math.min(1, opening / 32));
    for (let i = 0; i < p.length; i += 3) {
      if (this.inverseMass[i / 3] === 0) continue;
      const v = Math.floor(i / 3 / STRIDE) / ROWS;
      const u = (i / 3 % STRIDE) / COLUMNS;
      const exposed = this.side === 1 ? 1 : .68;
      const breath = .60 + .40 * Math.sin(this.time * .85 - v * 2.2 + this.side * .7);
      const flutter = Math.sin(this.time * 2.4 - v * 5.3 + u * 3.2 + this.side) * .15;
      const pressure = air * exposed * (2.4 * breath + flutter + this.gust * 3.5);
      const vx = (p[i] - previous[i]) * .975;
      const vy = (p[i + 1] - previous[i + 1]) * .975;
      const vz = (p[i + 2] - previous[i + 2]) * .975;
      previous[i] = p[i];previous[i + 1] = p[i + 1];previous[i + 2] = p[i + 2];
      // Wind enters through the casement and lifts the free lower fabric toward the room.
      const restZ = this.rest[i + 2];
      const memory = (restZ - p[i + 2]) * .85;
      const eddy = Math.sin(this.time * 1.3 - v * 6.8 + u * 2.5 + this.side) * air;
      const inner = this.side === -1 ? u : 1 - u;
      const parting = this.side * pressure * (.20 + inner * .85) * v;
      p[i] += vx + (Math.sin(this.time * .71 - v * 2.6) * .26 * air + parting + eddy * v * .6) * dt * dt;
      p[i + 1] += vy + (-2.2 + pressure * v * .45) * dt * dt;
      p[i + 2] += vz + (pressure * (.25 + Math.sin(v * 2.7) * 1.8) + memory + eddy * v * .65) * dt * dt;
    }
    for (let iteration = 0; iteration < 6; iteration++) {
      for (const constraint of this.constraints) {
        const { a, b, rest, stiffness } = constraint;
        const ia = a * 3, ib = b * 3;
        const wa = this.inverseMass[a], wb = this.inverseMass[b];
        const total = wa + wb;
        if (!total) continue;
        const dx = p[ib] - p[ia], dy = p[ib + 1] - p[ia + 1], dz = p[ib + 2] - p[ia + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || .0001;
        const factor = (distance - rest) / distance * stiffness / total;
        p[ia] += dx * factor * wa;p[ia + 1] += dy * factor * wa;p[ia + 2] += dz * factor * wa;
        p[ib] -= dx * factor * wb;p[ib + 1] -= dy * factor * wb;p[ib + 2] -= dz * factor * wb;
      }
      // Limit drag reach; the surrounding constraints distribute the pull.
      if (this.grab) {
        const g = this.grab;
        const col = g.index % STRIDE, row = Math.floor(g.index / STRIDE);
        const anchor = g.index * 3;
        const reach = LENGTH * row / ROWS * 1.03;
        const baseX = this.rest[anchor], baseZ = this.rest[col * 3 + 2];
        let dx = g.x - baseX, dy = g.y - TOP, dz = g.z - baseZ;
        const distance = Math.hypot(dx, dy, dz);
        if (distance > reach) { const k = reach / distance;dx *= k;dy *= k;dz *= k; }
        p[anchor] = baseX + dx;p[anchor + 1] = TOP + dy;p[anchor + 2] = baseZ + dz;
      }
      for (let index = 0; index < this.inverseMass.length; index++) {
        const i = index * 3;
        if (this.inverseMass[index] === 0) {
          p[i] = this.rest[i];p[i + 1] = this.rest[i + 1];p[i + 2] = this.rest[i + 2];
        } else {
          p[i] = Math.max(-2.2, Math.min(2.2, p[i]));
          p[i + 1] = Math.max(-1.55, Math.min(TOP + .03, p[i + 1]));
          p[i + 2] = Math.max(.27, Math.min(2.0, p[i + 2]));
        }
      }
    }
  }

  resetMomentum() { this.previous.set(this.positions);this.accumulator = 0; }
}
