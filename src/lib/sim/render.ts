import { computeOrbitDraw } from "./stats";
import { TRAIL_LEN, type Body, type FlingState, type Particle, type Rgb } from "./types";

export type Camera = { x: number; y: number; zoom: number };

export type Star = { x: number; y: number; r: number; a: number; layer: number };

export function makeStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() < 0.86 ? 0.6 + Math.random() * 0.8 : 1.2 + Math.random() * 1.1,
      a: 0.18 + Math.random() * 0.55,
      layer: Math.random() < 0.5 ? 0 : 1,
    });
  }
  return stars;
}

export function worldToScreen(
  wx: number,
  wy: number,
  cam: Camera,
  w: number,
  h: number,
): { x: number; y: number } {
  return {
    x: (wx - cam.x) * cam.zoom + w * 0.5,
    y: (wy - cam.y) * cam.zoom + h * 0.5,
  };
}

export function screenToWorld(
  sx: number,
  sy: number,
  cam: Camera,
  w: number,
  h: number,
): { x: number; y: number } {
  return {
    x: (sx - w * 0.5) / cam.zoom + cam.x,
    y: (sy - h * 0.5) / cam.zoom + cam.y,
  };
}

function rgba(c: Rgb, a: number): string {
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cam: Camera,
  bodies: Body[],
  particles: Particle[],
  stars: Star[],
  trailsOn: boolean,
  fling: FlingState | null,
  ghost: { x: Float32Array; y: Float32Array; count: number } | null,
  hoverId: number | null,
  selectedId: number | null,
  followId: number | null,
  shake: { x: number; y: number },
  time: number,
  alpha: number,
  reduced: boolean,
): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "#08090b";
  ctx.fillRect(0, 0, w, h);

  const wash = ctx.createRadialGradient(w * 0.5, h * 0.42, 40, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
  wash.addColorStop(0, "rgba(18, 20, 26, 0.9)");
  wash.addColorStop(1, "rgba(8, 9, 11, 0)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(shake.x, shake.y);

  drawStars(ctx, w, h, cam, stars, time, reduced);

  if (trailsOn) drawTrails(ctx, bodies, cam, w, h, alpha);
  drawKeplerOrbit(ctx, bodies, selectedId, cam, w, h);
  if (ghost && ghost.count > 1) drawGhost(ctx, ghost, cam, w, h);
  drawParticles(ctx, particles, cam, w, h);
  drawBodies(ctx, bodies, cam, w, h, hoverId, selectedId, followId, alpha);
  if (fling) drawFling(ctx, fling, bodies, cam, w, h);

  ctx.restore();

  const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.38, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

function drawKeplerOrbit(
  ctx: CanvasRenderingContext2D,
  bodies: Body[],
  selectedId: number | null,
  cam: Camera,
  w: number,
  h: number,
): void {
  if (selectedId == null) return;
  const body = bodies.find((b) => b.id === selectedId);
  if (!body) return;
  const hint = computeOrbitDraw(body, bodies);
  if (!hint) return;

  ctx.beginPath();
  ctx.setLineDash([4, 7]);
  ctx.strokeStyle = "rgba(197, 205, 214, 0.32)";
  ctx.lineWidth = 1.15;
  const steps = 96;
  const c = Math.cos(hint.rot);
  const s = Math.sin(hint.rot);
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const ox = hint.a * (Math.cos(theta) - hint.e);
    const oy = hint.b * Math.sin(theta);
    const wx = hint.fx + ox * c - oy * s;
    const wy = hint.fy + ox * s + oy * c;
    const p = worldToScreen(wx, wy, cam, w, h);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  const peri = worldToScreen(hint.periX, hint.periY, cam, w, h);
  ctx.beginPath();
  ctx.fillStyle = "rgba(236, 236, 232, 0.85)";
  ctx.arc(peri.x, peri.y, 2.4, 0, Math.PI * 2);
  ctx.fill();

  if (hint.apoX != null && hint.apoY != null) {
    const apo = worldToScreen(hint.apoX, hint.apoY, cam, w, h);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(197, 205, 214, 0.7)";
    ctx.lineWidth = 1;
    ctx.arc(apo.x, apo.y, 2.6, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cam: Camera,
  stars: Star[],
  time: number,
  reduced: boolean,
): void {
  for (const s of stars) {
    const parallax = s.layer === 0 ? 0.04 : 0.09;
    const px = ((s.x * w - cam.x * parallax) % w + w) % w;
    const py = ((s.y * h - cam.y * parallax) % h + h) % h;
    const tw = reduced ? 1 : 0.75 + 0.25 * Math.sin(time * (0.6 + s.a) + s.x * 12);
    ctx.beginPath();
    ctx.fillStyle = `rgba(236,236,232,${s.a * tw})`;
    ctx.arc(px, py, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTrails(
  ctx: CanvasRenderingContext2D,
  bodies: Body[],
  cam: Camera,
  w: number,
  h: number,
  alpha: number,
): void {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const b of bodies) {
    if (b.trailCount < 2) continue;
    const z = cam.zoom;
    ctx.lineWidth = Math.max(1, Math.min(4.5, b.radius * 0.18 * z));
    const n = b.trailCount;
    const chunks = 12;
    const chunk = Math.max(2, Math.floor(n / chunks));
    for (let c = 0; c < n - 1; c += chunk) {
      const end = Math.min(n - 1, c + chunk);
      const fade = (c / n) * 0.55 + 0.05;
      ctx.strokeStyle = rgba(b.color, fade);
      ctx.beginPath();
      for (let i = c; i <= end; i++) {
        const idx = (b.trailHead - n + i + TRAIL_LEN) % TRAIL_LEN;
        const x = i === n - 1 ? lerp(b.ix, b.x, alpha) : b.trailX[idx]!;
        const y = i === n - 1 ? lerp(b.iy, b.y, alpha) : b.trailY[idx]!;
        const s = worldToScreen(x, y, cam, w, h);
        if (i === c) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      }
      ctx.stroke();
    }
  }
}

function drawGhost(
  ctx: CanvasRenderingContext2D,
  ghost: { x: Float32Array; y: Float32Array; count: number },
  cam: Camera,
  w: number,
  h: number,
): void {
  ctx.beginPath();
  ctx.setLineDash([5, 6]);
  ctx.strokeStyle = "rgba(197, 205, 214, 0.55)";
  ctx.lineWidth = 1.25;
  for (let i = 0; i < ghost.count; i++) {
    const s = worldToScreen(ghost.x[i]!, ghost.y[i]!, cam, w, h);
    if (i === 0) ctx.moveTo(s.x, s.y);
    else ctx.lineTo(s.x, s.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  cam: Camera,
  w: number,
  h: number,
): void {
  for (const p of particles) {
    const s = worldToScreen(p.x, p.y, cam, w, h);
    ctx.beginPath();
    ctx.fillStyle = rgba(p.color, Math.max(0, p.life) * 0.9);
    ctx.arc(s.x, s.y, Math.max(0.6, p.size * cam.zoom), 0, Math.PI * 2);
    ctx.fill();
  }
}

function lightDir(bodies: Body[], body: Body): { x: number; y: number } {
  let lx = 0;
  let ly = 0;
  let wsum = 0;
  for (const other of bodies) {
    if (other === body || other.kind !== "star") continue;
    const dx = other.x - body.x;
    const dy = other.y - body.y;
    const d2 = dx * dx + dy * dy + 40;
    const wt = other.mass / d2;
    lx += dx * wt;
    ly += dy * wt;
    wsum += wt;
  }
  if (wsum < 1e-8) return { x: -0.45, y: -0.55 };
  const m = Math.hypot(lx, ly) || 1;
  return { x: lx / m, y: ly / m };
}

function drawBodies(
  ctx: CanvasRenderingContext2D,
  bodies: Body[],
  cam: Camera,
  w: number,
  h: number,
  hoverId: number | null,
  selectedId: number | null,
  followId: number | null,
  alpha: number,
): void {
  const ordered = bodies.slice().sort((a, b) => b.mass - a.mass);
  for (const b of ordered) {
    const x = lerp(b.ix, b.x, alpha);
    const y = lerp(b.iy, b.y, alpha);
    const s = worldToScreen(x, y, cam, w, h);
    const r = Math.max(1.2, b.radius * b.pop * cam.zoom);
    if (s.x < -r * 4 || s.y < -r * 4 || s.x > w + r * 4 || s.y > h + r * 4) continue;

    const glowR = r * (b.kind === "star" ? 3.4 : 2.1);
    const glow = ctx.createRadialGradient(s.x, s.y, r * 0.2, s.x, s.y, glowR);
    const ga = b.kind === "star" ? 0.42 : 0.16;
    glow.addColorStop(0, rgba(b.color, ga));
    glow.addColorStop(1, rgba(b.color, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
    ctx.fill();

    const L = lightDir(bodies, b);
    const hx = s.x - L.x * r * 0.35;
    const hy = s.y - L.y * r * 0.35;
    const g = ctx.createRadialGradient(hx, hy, r * 0.08, s.x, s.y, r);
    const c = b.color;
    g.addColorStop(0, `rgb(${Math.min(255, c[0] + 48)},${Math.min(255, c[1] + 44)},${Math.min(255, c[2] + 36)})`);
    g.addColorStop(0.45, rgba(c, 1));
    g.addColorStop(
      1,
      `rgb(${Math.max(0, c[0] * 0.28)},${Math.max(0, c[1] * 0.28)},${Math.max(0, c[2] * 0.3)})`,
    );
    ctx.beginPath();
    ctx.fillStyle = g;
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fill();

    if (b.kind === "star") {
      const core = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 0.55);
      core.addColorStop(0, "rgba(255,252,246,0.85)");
      core.addColorStop(1, "rgba(255,252,246,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }

    const selected = b.id === selectedId;
    const following = b.id === followId;
    const hovered = b.id === hoverId;
    if (selected || following || hovered) {
      ctx.beginPath();
      ctx.strokeStyle = selected || following ? "rgba(236,236,232,0.78)" : "rgba(197,205,214,0.5)";
      ctx.lineWidth = selected || following ? 1.6 : 1.15;
      ctx.setLineDash(following && !selected ? [4, 4] : []);
      ctx.arc(s.x, s.y, r + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

function drawFling(
  ctx: CanvasRenderingContext2D,
  fling: FlingState,
  bodies: Body[],
  cam: Camera,
  w: number,
  h: number,
): void {
  const origin = worldToScreen(fling.startX, fling.startY, cam, w, h);
  const end = worldToScreen(fling.curX, fling.curY, cam, w, h);
  ctx.beginPath();
  ctx.strokeStyle = "rgba(236, 236, 232, 0.8)";
  ctx.lineWidth = 1.5;
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  const ang = Math.atan2(end.y - origin.y, end.x - origin.x);
  const ah = 8;
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(end.x - Math.cos(ang - 0.45) * ah, end.y - Math.sin(ang - 0.45) * ah);
  ctx.lineTo(end.x - Math.cos(ang + 0.45) * ah, end.y - Math.sin(ang + 0.45) * ah);
  ctx.closePath();
  ctx.fillStyle = "rgba(236, 236, 232, 0.85)";
  ctx.fill();

  const ghostBody = fling.bodyId != null ? bodies.find((b) => b.id === fling.bodyId) : null;
  const r = (ghostBody?.radius ?? 12) * cam.zoom;
  ctx.beginPath();
  ctx.strokeStyle = "rgba(197, 205, 214, 0.7)";
  ctx.setLineDash([3, 3]);
  ctx.arc(origin.x, origin.y, Math.max(4, r), 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}
