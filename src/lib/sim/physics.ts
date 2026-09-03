import {
  G,
  KIND_COLOR,
  KIND_DENSITY,
  TRAIL_LEN,
  type Body,
  type BodyKind,
  type BodySeed,
  type Particle,
  type Rgb,
} from "./types";

let nextId = 1;

export function radiusFromMass(mass: number, kind: BodyKind): number {
  return Math.max(2.4, KIND_DENSITY[kind] * Math.cbrt(Math.max(mass, 0.2)));
}

export function kindFromMass(mass: number, preferred?: BodyKind): BodyKind {
  if (preferred === "star" || mass >= 900) return "star";
  if (mass >= 140) return "giant";
  if (mass >= 22) return "planet";
  if (mass >= 5) return "moon";
  return "dust";
}

export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  const u = 1 - t;
  return [
    Math.round(a[0] * u + b[0] * t),
    Math.round(a[1] * u + b[1] * t),
    Math.round(a[2] * u + b[2] * t),
  ];
}

export function createBody(seed: BodySeed): Body {
  const kind = seed.kind;
  const radius = seed.radius ?? radiusFromMass(seed.mass, kind);
  return {
    id: nextId++,
    x: seed.x,
    y: seed.y,
    vx: seed.vx,
    vy: seed.vy,
    ax: 0,
    ay: 0,
    ix: seed.x,
    iy: seed.y,
    mass: seed.mass,
    radius,
    kind,
    color: seed.color ?? KIND_COLOR[kind],
    trailX: new Float32Array(TRAIL_LEN),
    trailY: new Float32Array(TRAIL_LEN),
    trailHead: 0,
    trailCount: 0,
    held: false,
    pop: 1,
  };
}

export function resetIds(): void {
  nextId = 1;
}

function recordTrail(body: Body): void {
  body.trailX[body.trailHead] = body.x;
  body.trailY[body.trailHead] = body.y;
  body.trailHead = (body.trailHead + 1) % TRAIL_LEN;
  if (body.trailCount < TRAIL_LEN) body.trailCount += 1;
}

export function circularSpeed(parentMass: number, distance: number): number {
  return Math.sqrt((G * parentMass) / Math.max(distance, 1));
}

export function orbitVelocity(
  parent: { x: number; y: number; vx: number; vy: number; mass: number },
  x: number,
  y: number,
  prograde = 1,
): { vx: number; vy: number } {
  const dx = x - parent.x;
  const dy = y - parent.y;
  const dist = Math.hypot(dx, dy) || 1;
  const speed = circularSpeed(parent.mass, dist) * prograde;
  return {
    vx: parent.vx - (dy / dist) * speed,
    vy: parent.vy + (dx / dist) * speed,
  };
}

type MergeEvent = {
  x: number;
  y: number;
  mass: number;
  speed: number;
  color: Rgb;
  id: number;
};

function combineKind(a: Body, b: Body, mass: number): BodyKind {
  if (a.kind === "star" || b.kind === "star") return "star";
  return kindFromMass(mass);
}

function mergePair(keep: Body, drop: Body): void {
  const m = keep.mass + drop.mass;
  keep.x = (keep.x * keep.mass + drop.x * drop.mass) / m;
  keep.y = (keep.y * keep.mass + drop.y * drop.mass) / m;
  keep.vx = (keep.vx * keep.mass + drop.vx * drop.mass) / m;
  keep.vy = (keep.vy * keep.mass + drop.vy * drop.mass) / m;
  keep.color = mixRgb(keep.color, drop.color, drop.mass / m);
  keep.kind = combineKind(keep, drop, m);
  keep.mass = m;
  keep.radius = radiusFromMass(m, keep.kind);
  keep.pop = 1.28;
  keep.ax = 0;
  keep.ay = 0;
  if (drop.trailCount > keep.trailCount) {
    keep.trailX = drop.trailX;
    keep.trailY = drop.trailY;
    keep.trailHead = drop.trailHead;
    keep.trailCount = drop.trailCount;
  }
}

export function computeForces(bodies: Body[]): number {
  const n = bodies.length;
  for (let i = 0; i < n; i++) {
    const b = bodies[i]!;
    b.ax = 0;
    b.ay = 0;
  }

  let minSep = Infinity;

  for (let i = 0; i < n; i++) {
    const a = bodies[i]!;
    for (let j = i + 1; j < n; j++) {
      const b = bodies[j]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const r2 = dx * dx + dy * dy;
      const dist = Math.sqrt(r2);
      const touch = a.radius + b.radius;
      if (dist < minSep) minSep = dist;

      const eps = 0.06 * touch;
      const soft = r2 + eps * eps;
      const inv = 1 / (soft * Math.sqrt(soft));
      const s = G * inv;
      const fx = dx * s;
      const fy = dy * s;
      a.ax += fx * b.mass;
      a.ay += fy * b.mass;
      b.ax -= fx * a.mass;
      b.ay -= fy * a.mass;
    }
  }

  return minSep;
}

function resolveMerges(bodies: Body[], events: MergeEvent[]): Body[] {
  let list = bodies;
  let changed = true;
  while (changed) {
    changed = false;
    outer: for (let i = 0; i < list.length; i++) {
      const a = list[i]!;
      if (a.held) continue;
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j]!;
        if (b.held) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const limit = (a.radius + b.radius) * 0.9;
        if (dx * dx + dy * dy > limit * limit) continue;

        const keep = a.mass >= b.mass ? a : b;
        const drop = keep === a ? b : a;
        const rel = Math.hypot(a.vx - b.vx, a.vy - b.vy);
        const mx = (a.x * a.mass + b.x * b.mass) / (a.mass + b.mass);
        const my = (a.y * a.mass + b.y * b.mass) / (a.mass + b.mass);
        mergePair(keep, drop);
        events.push({
          x: mx,
          y: my,
          mass: keep.mass,
          speed: rel,
          color: keep.color,
          id: keep.id,
        });
        list = list.filter((body) => body !== drop);
        changed = true;
        break outer;
      }
    }
  }
  return list;
}

export function leapfrog(bodies: Body[], dt: number, events: MergeEvent[]): Body[] {
  const n = bodies.length;
  for (let i = 0; i < n; i++) {
    const b = bodies[i]!;
    if (b.held) continue;
    b.vx += b.ax * dt * 0.5;
    b.vy += b.ay * dt * 0.5;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }

  computeForces(bodies);

  for (let i = 0; i < n; i++) {
    const b = bodies[i]!;
    if (b.held) continue;
    b.vx += b.ax * dt * 0.5;
    b.vy += b.ay * dt * 0.5;
    const speed = Math.hypot(b.vx, b.vy);
    if (speed > 2800) {
      const s = 2800 / speed;
      b.vx *= s;
      b.vy *= s;
    }
  }

  return resolveMerges(bodies, events);
}

export function markFrameStart(bodies: Body[]): void {
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i]!;
    b.ix = b.x;
    b.iy = b.y;
  }
}

export function advanceTrails(bodies: Body[], cadence: number, tick: number): void {
  if (tick % cadence !== 0) return;
  for (let i = 0; i < bodies.length; i++) {
    recordTrail(bodies[i]!);
  }
}

export function decayPops(bodies: Body[], dt: number): void {
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i]!;
    if (b.pop > 1) {
      b.pop = 1 + (b.pop - 1) * Math.exp(-10 * dt);
      if (b.pop < 1.01) b.pop = 1;
    }
  }
}

export function cullEscaped(bodies: Body[], originX: number, originY: number): Body[] {
  const limit2 = 18000 * 18000;
  return bodies.filter((b) => {
    const dx = b.x - originX;
    const dy = b.y - originY;
    return dx * dx + dy * dy < limit2;
  });
}

export function predictPath(
  bodies: Body[],
  spawn: { x: number; y: number; vx: number; vy: number; mass: number; radius: number },
  seconds: number,
): { x: Float32Array; y: Float32Array; count: number } {
  const n = bodies.length + 1;
  const xs = new Float64Array(n);
  const ys = new Float64Array(n);
  const vxs = new Float64Array(n);
  const vys = new Float64Array(n);
  const mass = new Float64Array(n);
  const rad = new Float64Array(n);

  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i]!;
    xs[i] = b.x;
    ys[i] = b.y;
    vxs[i] = b.vx;
    vys[i] = b.vy;
    mass[i] = b.mass;
    rad[i] = b.radius;
  }
  const s = n - 1;
  xs[s] = spawn.x;
  ys[s] = spawn.y;
  vxs[s] = spawn.vx;
  vys[s] = spawn.vy;
  mass[s] = spawn.mass;
  rad[s] = spawn.radius;

  const dt = 1 / 45;
  const steps = Math.min(420, Math.floor(seconds / dt));
  const px = new Float32Array(steps);
  const py = new Float32Array(steps);
  let count = 0;
  const ax = new Float64Array(n);
  const ay = new Float64Array(n);

  const forces = () => {
    ax.fill(0);
    ay.fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = xs[j]! - xs[i]!;
        const dy = ys[j]! - ys[i]!;
        const r2 = dx * dx + dy * dy + 16;
        const inv = 1 / (r2 * Math.sqrt(r2));
        const k = G * inv;
        const fx = dx * k;
        const fy = dy * k;
        ax[i]! += fx * mass[j]!;
        ay[i]! += fy * mass[j]!;
        ax[j]! -= fx * mass[i]!;
        ay[j]! -= fy * mass[i]!;
      }
    }
  };

  forces();
  for (let step = 0; step < steps; step++) {
    for (let i = 0; i < n; i++) {
      vxs[i]! += ax[i]! * dt * 0.5;
      vys[i]! += ay[i]! * dt * 0.5;
      xs[i]! += vxs[i]! * dt;
      ys[i]! += vys[i]! * dt;
    }
    forces();
    for (let i = 0; i < n; i++) {
      vxs[i]! += ax[i]! * dt * 0.5;
      vys[i]! += ay[i]! * dt * 0.5;
    }

    px[count] = xs[s]!;
    py[count] = ys[s]!;
    count++;

    for (let i = 0; i < s; i++) {
      const dx = xs[s]! - xs[i]!;
      const dy = ys[s]! - ys[i]!;
      const lim = (rad[s]! + rad[i]!) * 0.9;
      if (dx * dx + dy * dy < lim * lim) {
        return { x: px, y: py, count };
      }
    }
  }

  return { x: px, y: py, count };
}

export function spawnParticles(
  particles: Particle[],
  x: number,
  y: number,
  color: Rgb,
  count: number,
  speed: number,
): void {
  const n = Math.min(count, 36);
  for (let i = 0; i < n; i++) {
    const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const mag = speed * (0.35 + Math.random() * 0.9);
    particles.push({
      x,
      y,
      vx: Math.cos(ang) * mag,
      vy: Math.sin(ang) * mag,
      life: 1,
      maxLife: 0.35 + Math.random() * 0.55,
      size: 1.2 + Math.random() * 2.4,
      color,
    });
  }
}

export function stepParticles(particles: Particle[], dt: number): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]!;
    p.life -= dt / p.maxLife;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.exp(-1.8 * dt);
    p.vy *= Math.exp(-1.8 * dt);
    if (p.life <= 0) particles.splice(i, 1);
  }
}

export type { MergeEvent };
