import { G, type Body, type BodyKind } from "./types";

export type OrbitClass = "bound" | "escape" | "flyby";

export type BodyStats = {
  id: number;
  kind: BodyKind;
  mass: number;
  radius: number;
  speed: number;
  headingDeg: number;
  accel: number;
  kinetic: number;
  primaryKind: BodyKind | null;
  distance: number | null;
  relSpeed: number | null;
  orbit: OrbitClass | null;
  eccentricity: number | null;
  period: number | null;
  periapsis: number | null;
  apoapsis: number | null;
  semiMajor: number | null;
  circularSpeed: number | null;
  escapeSpeed: number | null;
  specificEnergy: number | null;
  angularMomentum: number | null;
  speedHistory: number[];
};

export type OrbitDraw = {
  fx: number;
  fy: number;
  a: number;
  b: number;
  e: number;
  rot: number;
  periX: number;
  periY: number;
  apoX: number | null;
  apoY: number | null;
};

function emptyKinematics(body: Body, speed: number, accel: number, headingDeg: number, kinetic: number): BodyStats {
  return {
    id: body.id,
    kind: body.kind,
    mass: body.mass,
    radius: body.radius,
    speed,
    headingDeg,
    accel,
    kinetic,
    primaryKind: null,
    distance: null,
    relSpeed: null,
    orbit: null,
    eccentricity: null,
    period: null,
    periapsis: null,
    apoapsis: null,
    semiMajor: null,
    circularSpeed: null,
    escapeSpeed: null,
    specificEnergy: null,
    angularMomentum: null,
    speedHistory: [],
  };
}

function primaryFor(body: Body, bodies: Body[]): Body | null {
  let best: Body | null = null;
  let bestScore = Infinity;
  for (let i = 0; i < bodies.length; i++) {
    const other = bodies[i]!;
    if (other.id === body.id) continue;
    if (other.mass < body.mass * 1.15) continue;
    const d = Math.hypot(other.x - body.x, other.y - body.y);
    const score = d / Math.cbrt(Math.max(other.mass, 1));
    if (score < bestScore) {
      best = other;
      bestScore = score;
    }
  }
  return best;
}

export function computeOrbitDraw(body: Body, bodies: Body[]): OrbitDraw | null {
  const primary = primaryFor(body, bodies);
  if (!primary || primary.mass < body.mass * 1.15) return null;

  const dx = body.x - primary.x;
  const dy = body.y - primary.y;
  const r = Math.hypot(dx, dy) || 1;
  const rvx = body.vx - primary.vx;
  const rvy = body.vy - primary.vy;
  const v2 = rvx * rvx + rvy * rvy;
  const mu = G * (primary.mass + body.mass);
  const energy = v2 / 2 - mu / r;
  const h = dx * rvy - dy * rvx;
  const ex = (rvy * h) / mu - dx / r;
  const ey = (-rvx * h) / mu - dy / r;
  const e = Math.hypot(ex, ey);
  if (!(energy < 0) || e >= 0.98) return null;

  const a = -mu / (2 * energy);
  if (!(a > 12) || a > 14000) return null;
  const b = a * Math.sqrt(Math.max(0, 1 - e * e));
  const rot = Math.atan2(ey, ex);
  const periR = a * (1 - e);
  const apoR = a * (1 + e);
  const c = Math.cos(rot);
  const s = Math.sin(rot);

  return {
    fx: primary.x,
    fy: primary.y,
    a,
    b,
    e,
    rot,
    periX: primary.x + c * periR,
    periY: primary.y + s * periR,
    apoX: primary.x - c * apoR,
    apoY: primary.y - s * apoR,
  };
}

export function computeBodyStats(body: Body, bodies: Body[], speedHistory: number[] = []): BodyStats {
  const speed = Math.hypot(body.vx, body.vy);
  const accel = Math.hypot(body.ax, body.ay);
  const headingDeg = speed > 0.05 ? (Math.atan2(body.vy, body.vx) * 180) / Math.PI : 0;
  const kinetic = 0.5 * body.mass * speed * speed;

  const primary = primaryFor(body, bodies);
  if (!primary || primary.mass < body.mass * 1.15) {
    return { ...emptyKinematics(body, speed, accel, headingDeg, kinetic), speedHistory };
  }

  const dx = body.x - primary.x;
  const dy = body.y - primary.y;
  const r = Math.hypot(dx, dy) || 1;
  const rvx = body.vx - primary.vx;
  const rvy = body.vy - primary.vy;
  const v = Math.hypot(rvx, rvy);
  const mu = G * (primary.mass + body.mass);
  const energy = (v * v) / 2 - mu / r;
  const h = dx * rvy - dy * rvx;
  const ex = (rvy * h) / mu - dx / r;
  const ey = (-rvx * h) / mu - dy / r;
  const e = Math.hypot(ex, ey);
  const circularSpeed = Math.sqrt(mu / r);
  const escapeSpeed = Math.sqrt((2 * mu) / r);

  let orbit: OrbitClass;
  let period: number | null = null;
  let semiMajor: number | null = null;
  let periapsis: number | null = null;
  let apoapsis: number | null = null;

  if (energy < 0 && e < 0.98) {
    orbit = "bound";
    const a = -mu / (2 * energy);
    if (a > 0) {
      semiMajor = a;
      period = 2 * Math.PI * Math.sqrt((a * a * a) / mu);
      periapsis = a * (1 - e);
      apoapsis = a * (1 + e);
    }
  } else if (e < 1.05) {
    orbit = "flyby";
    const a = energy !== 0 ? -mu / (2 * energy) : null;
    if (a != null) periapsis = Math.abs(a * (1 - e));
  } else {
    orbit = "escape";
    const a = energy !== 0 ? -mu / (2 * energy) : null;
    if (a != null) periapsis = Math.abs(a * (1 - e));
  }

  return {
    id: body.id,
    kind: body.kind,
    mass: body.mass,
    radius: body.radius,
    speed,
    headingDeg,
    accel,
    kinetic,
    primaryKind: primary.kind,
    distance: r,
    relSpeed: v,
    orbit,
    eccentricity: e,
    period,
    periapsis,
    apoapsis,
    semiMajor,
    circularSpeed,
    escapeSpeed,
    specificEnergy: energy,
    angularMomentum: h,
    speedHistory,
  };
}

export function formatStat(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a >= 10000) return n.toExponential(1).replace("+", "");
  if (a >= 100) return n.toFixed(0);
  if (a < 0.05 && a > 0) return n.toExponential(1).replace("+", "");
  return n.toFixed(digits);
}

export function formatPeriod(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  if (seconds >= 120) return `${formatStat(seconds / 60)} min`;
  return `${formatStat(seconds)} s`;
}
