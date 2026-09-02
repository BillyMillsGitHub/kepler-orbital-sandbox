import { SimAudio } from "./audio";
import {
  advanceTrails,
  computeForces,
  createBody,
  cullEscaped,
  decayPops,
  leapfrog,
  markFrameStart,
  predictPath,
  radiusFromMass,
  spawnParticles,
  stepParticles,
  type MergeEvent,
} from "./physics";
import { drawScene, makeStars, screenToWorld, type Camera, type Star } from "./render";
import { fitCamera, loadScenario } from "./scenarios";
import { useSimStore } from "./store";
import {
  FIXED_DT,
  MASS_PRESETS,
  MAX_BODIES,
  type Body,
  type FlingState,
  type MassPresetId,
  type PanState,
  type Particle,
  type PinchState,
  type ScenarioId,
} from "./types";

const THROW_TIME = 0.38;
const ZOOM_MIN = 0.12;
const ZOOM_MAX = 3.6;
const LS_KEY = "kepler-prefs-v1";

type Prefs = {
  trails: boolean;
  muted: boolean;
  timeScale: number;
  massPreset: MassPresetId;
  help: boolean;
};

function readPrefs(): Partial<Prefs> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Prefs>;
  } catch {
    return {};
  }
}

function writePrefs(p: Prefs): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export class Simulation {
  bodies: Body[] = [];
  particles: Particle[] = [];
  camera: Camera = { x: 0, y: 0, zoom: 0.85 };
  camTarget: Camera = { x: 0, y: 0, zoom: 0.85 };
  paused = false;
  timeScale = 1;
  trails = true;
  massPreset: MassPresetId = "planet";
  scenario: ScenarioId = "helios";
  followId: number | null = null;
  hoverId: number | null = null;
  showHelp = true;
  width = 1;
  height = 1;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private audio = new SimAudio();
  private stars: Star[] = makeStars(160);
  private keys = new Set<string>();
  private pointers = new Map<number, { x: number; y: number }>();
  private fling: FlingState | null = null;
  private pan: PanState | null = null;
  private pinch: PinchState | null = null;
  private ghost: { x: Float32Array; y: Float32Array; count: number } | null = null;
  private ghostAt = 0;
  private acc = 0;
  private lastT = 0;
  private raf = 0;
  private trailTick = 0;
  private trauma = 0;
  private reduced = false;
  private running = false;
  private unsubs: Array<() => void> = [];
  private hudClock = 0;
  private noiseT = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) throw new Error("Canvas 2D is unavailable");
    this.ctx = ctx;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prefs = readPrefs();
    if (typeof prefs.trails === "boolean") this.trails = prefs.trails;
    if (typeof prefs.muted === "boolean") this.audio.muted = prefs.muted;
    if (typeof prefs.timeScale === "number") this.timeScale = prefs.timeScale;
    if (prefs.massPreset) this.massPreset = prefs.massPreset;
    if (typeof prefs.help === "boolean") this.showHelp = prefs.help;
    this.load("helios");
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.bind();
    this.lastT = performance.now();
    this.raf = requestAnimationFrame(this.frame);
    this.pushHud();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    for (const off of this.unsubs) off();
    this.unsubs = [];
    this.keys.clear();
    this.pointers.clear();
  }

  resize(cssW: number, cssH: number, dpr: number): void {
    this.width = cssW;
    this.height = cssH;
    this.canvas.width = Math.max(1, Math.floor(cssW * dpr));
    this.canvas.height = Math.max(1, Math.floor(cssH * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  load(id: ScenarioId): void {
    this.scenario = id;
    this.paused = false;
    this.bodies = loadScenario(id);
    this.particles.length = 0;
    this.followId = null;
    this.fling = null;
    this.ghost = null;
    computeForces(this.bodies);
    const fit = fitCamera(this.bodies);
    this.camera = { ...fit };
    this.camTarget = { ...fit };
    if (id === "empty") {
      this.camTarget.zoom = Math.min(this.camTarget.zoom, 0.9);
    }
    this.pushHud();
  }

  clear(): void {
    this.bodies = [];
    this.particles.length = 0;
    this.followId = null;
    this.fling = null;
    this.ghost = null;
    this.pushHud();
  }

  togglePause(): void {
    this.paused = !this.paused;
    this.pushHud();
  }

  setTimeScale(v: number): void {
    this.timeScale = Math.min(4, Math.max(0.15, v));
    this.persist();
    this.pushHud();
  }

  setTrails(on: boolean): void {
    this.trails = on;
    this.persist();
    this.pushHud();
  }

  setMuted(on: boolean): void {
    this.audio.setMuted(on);
    this.persist();
    this.pushHud();
  }

  setMassPreset(id: MassPresetId): void {
    this.massPreset = id;
    this.persist();
    this.pushHud();
  }

  dismissHelp(): void {
    this.showHelp = false;
    this.persist();
    this.pushHud();
  }

  private persist(): void {
    writePrefs({
      trails: this.trails,
      muted: this.audio.muted,
      timeScale: this.timeScale,
      massPreset: this.massPreset,
      help: this.showHelp,
    });
  }

  private pushHud(): void {
    useSimStore.getState().patch({
      ready: true,
      paused: this.paused,
      timeScale: this.timeScale,
      trails: this.trails,
      muted: this.audio.muted,
      massPreset: this.massPreset,
      bodyCount: this.bodies.length,
      scenario: this.scenario,
      following: this.followId != null,
      showHelp: this.showHelp,
    });
  }

  private bind(): void {
    const c = this.canvas;
    const add = (
      el: EventTarget,
      type: string,
      fn: EventListener,
      opts?: AddEventListenerOptions,
    ) => {
      el.addEventListener(type, fn, opts);
      this.unsubs.push(() => el.removeEventListener(type, fn, opts));
    };

    add(c, "pointerdown", (e) => this.onPointerDown(e as PointerEvent));
    add(c, "pointermove", (e) => this.onPointerMove(e as PointerEvent));
    add(c, "pointerup", (e) => this.onPointerUp(e as PointerEvent));
    add(c, "pointercancel", (e) => this.onPointerUp(e as PointerEvent));
    add(c, "wheel", (e) => this.onWheel(e as WheelEvent), { passive: false });
    add(c, "contextmenu", (e) => (e as Event).preventDefault());
    add(window, "keydown", (e) => this.onKey(e as KeyboardEvent, true));
    add(window, "keyup", (e) => this.onKey(e as KeyboardEvent, false));
    add(window, "blur", () => this.keys.clear());
    add(document, "visibilitychange", () => {
      if (document.hidden) this.keys.clear();
      else this.audio.unlock();
    });
  }

  private clientToCanvas(e: PointerEvent | WheelEvent): { x: number; y: number } {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private hitBody(wx: number, wy: number): Body | null {
    const slop = 10 / this.camera.zoom;
    let best: Body | null = null;
    let bestD = Infinity;
    for (const b of this.bodies) {
      const d = Math.hypot(b.x - wx, b.y - wy);
      if (d < b.radius + slop && d < bestD) {
        best = b;
        bestD = d;
      }
    }
    return best;
  }

  private onPointerDown(e: PointerEvent): void {
    this.audio.unlock();
    const p = this.clientToCanvas(e);
    this.pointers.set(e.pointerId, p);
    try {
      this.canvas.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    if (this.pointers.size === 2) {
      if (this.fling?.bodyId != null) {
        const held = this.bodies.find((b) => b.id === this.fling!.bodyId);
        if (held) held.held = false;
      }
      this.fling = null;
      this.pan = null;
      const ids = [...this.pointers.keys()];
      const pts = [...this.pointers.values()];
      const a = pts[0]!;
      const b = pts[1]!;
      this.pinch = {
        a: ids[0]!,
        b: ids[1]!,
        lastDist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        lastMidX: (a.x + b.x) * 0.5,
        lastMidY: (a.y + b.y) * 0.5,
      };
      return;
    }

    if (e.button === 1 || e.button === 2) {
      this.pan = { pointerId: e.pointerId, lastX: p.x, lastY: p.y };
      return;
    }

    const world = screenToWorld(p.x, p.y, this.camera, this.width, this.height);
    const hit = this.hitBody(world.x, world.y);
    this.fling = {
      pointerId: e.pointerId,
      startX: hit ? hit.x : world.x,
      startY: hit ? hit.y : world.y,
      curX: world.x,
      curY: world.y,
      bodyId: hit ? hit.id : null,
      screenX: p.x,
      screenY: p.y,
    };
    if (hit) hit.held = true;
  }

  private onPointerMove(e: PointerEvent): void {
    const p = this.clientToCanvas(e);
    this.pointers.set(e.pointerId, p);

    if (this.pinch && this.pointers.size >= 2) {
      const pts = [...this.pointers.values()];
      const a = pts[0]!;
      const b = pts[1]!;
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const midX = (a.x + b.x) * 0.5;
      const midY = (a.y + b.y) * 0.5;
      const world = screenToWorld(midX, midY, this.camera, this.width, this.height);
      const factor = dist / this.pinch.lastDist;
      this.camTarget.zoom = clamp(this.camTarget.zoom * factor, ZOOM_MIN, ZOOM_MAX);
      this.camera.zoom = this.camTarget.zoom;
      const after = screenToWorld(midX, midY, this.camera, this.width, this.height);
      this.camera.x += world.x - after.x;
      this.camera.y += world.y - after.y;
      this.camTarget.x = this.camera.x;
      this.camTarget.y = this.camera.y;
      this.camera.x -= (midX - this.pinch.lastMidX) / this.camera.zoom;
      this.camera.y -= (midY - this.pinch.lastMidY) / this.camera.zoom;
      this.camTarget.x = this.camera.x;
      this.camTarget.y = this.camera.y;
      this.pinch.lastDist = dist;
      this.pinch.lastMidX = midX;
      this.pinch.lastMidY = midY;
      return;
    }

    if (this.pan && this.pan.pointerId === e.pointerId) {
      this.followId = null;
      this.camTarget.x -= (p.x - this.pan.lastX) / this.camera.zoom;
      this.camTarget.y -= (p.y - this.pan.lastY) / this.camera.zoom;
      this.camera.x = this.camTarget.x;
      this.camera.y = this.camTarget.y;
      this.pan.lastX = p.x;
      this.pan.lastY = p.y;
      return;
    }

    if (this.fling && this.fling.pointerId === e.pointerId) {
      const world = screenToWorld(p.x, p.y, this.camera, this.width, this.height);
      this.fling.curX = world.x;
      this.fling.curY = world.y;
      this.fling.screenX = p.x;
      this.fling.screenY = p.y;
      const body = this.fling.bodyId != null ? this.bodies.find((b) => b.id === this.fling!.bodyId) : null;
      if (body) {
        body.x = this.fling.startX;
        body.y = this.fling.startY;
      }
      this.maybePredict();
      return;
    }

    const world = screenToWorld(p.x, p.y, this.camera, this.width, this.height);
    this.hoverId = this.hitBody(world.x, world.y)?.id ?? null;
  }

  private onPointerUp(e: PointerEvent): void {
    const p = this.clientToCanvas(e);
    this.pointers.delete(e.pointerId);
    if (this.pinch) {
      this.pinch = null;
      this.fling = null;
      this.pan = null;
      return;
    }
    if (this.pan && this.pan.pointerId === e.pointerId) {
      this.pan = null;
      return;
    }
    if (this.fling && this.fling.pointerId === e.pointerId) {
      const world = screenToWorld(p.x, p.y, this.camera, this.width, this.height);
      this.commitFling(world.x, world.y);
    }
  }

  private commitFling(x: number, y: number): void {
    const f = this.fling;
    this.fling = null;
    this.ghost = null;
    if (!f) return;
    const dx = x - f.startX;
    const dy = y - f.startY;
    const dist = Math.hypot(dx, dy);
    const vx = dx / THROW_TIME;
    const vy = dy / THROW_TIME;
    const preset = MASS_PRESETS.find((m) => m.id === this.massPreset) ?? MASS_PRESETS[2]!;

    const existing = f.bodyId != null ? this.bodies.find((b) => b.id === f.bodyId) : null;
    if (existing) {
      existing.held = false;
      if (dist < 6 / this.camera.zoom) {
        this.followId = this.followId === existing.id ? null : existing.id;
        this.pushHud();
        return;
      }
      existing.vx = vx;
      existing.vy = vy;
      this.audio.fling(Math.hypot(vx, vy));
      this.pushHud();
      return;
    }

    if (this.bodies.length >= MAX_BODIES) return;
    const body = createBody({
      x: f.startX,
      y: f.startY,
      vx: dist < 6 / this.camera.zoom ? 0 : vx,
      vy: dist < 6 / this.camera.zoom ? 0 : vy,
      mass: preset.mass,
      kind: preset.kind,
    });
    this.bodies.push(body);
    this.audio.fling(Math.hypot(body.vx, body.vy));
    this.pushHud();
  }

  private maybePredict(): void {
    const now = performance.now();
    if (now - this.ghostAt < 40 || !this.fling) return;
    this.ghostAt = now;
    const f = this.fling;
    const dx = f.curX - f.startX;
    const dy = f.curY - f.startY;
    const existing = f.bodyId != null ? this.bodies.find((b) => b.id === f.bodyId) : null;
    const preset = MASS_PRESETS.find((m) => m.id === this.massPreset) ?? MASS_PRESETS[2]!;
    const mass = existing?.mass ?? preset.mass;
    const radius = existing?.radius ?? radiusFromMass(mass, existing?.kind ?? preset.kind);
    const others = existing ? this.bodies.filter((b) => b !== existing) : this.bodies;
    this.ghost = predictPath(
      others,
      {
        x: f.startX,
        y: f.startY,
        vx: dx / THROW_TIME,
        vy: dy / THROW_TIME,
        mass,
        radius,
      },
      others.length > 18 ? 2.2 : 3.6,
    );
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const p = this.clientToCanvas(e);
    const before = screenToWorld(p.x, p.y, this.camera, this.width, this.height);
    const factor = Math.exp(-e.deltaY * 0.00115);
    this.camTarget.zoom = clamp(this.camTarget.zoom * factor, ZOOM_MIN, ZOOM_MAX);
    this.camera.zoom = this.camTarget.zoom;
    const after = screenToWorld(p.x, p.y, this.camera, this.width, this.height);
    this.camera.x += before.x - after.x;
    this.camera.y += before.y - after.y;
    this.camTarget.x = this.camera.x;
    this.camTarget.y = this.camera.y;
    this.followId = this.followId;
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (down) {
      const gameKeys = new Set(["Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS"]);
      if (gameKeys.has(e.code)) e.preventDefault();
    }
    if (down) this.keys.add(e.code);
    else this.keys.delete(e.code);
    if (!down) return;

    this.audio.unlock();
    switch (e.code) {
      case "Space":
        this.togglePause();
        break;
      case "KeyC":
        this.clear();
        break;
      case "KeyT":
        this.setTrails(!this.trails);
        break;
      case "KeyM":
        this.setMuted(!this.audio.muted);
        break;
      case "Digit1":
        this.setMassPreset("dust");
        break;
      case "Digit2":
        this.setMassPreset("moon");
        break;
      case "Digit3":
        this.setMassPreset("planet");
        break;
      case "Digit4":
        this.setMassPreset("giant");
        break;
      case "Digit5":
        this.setMassPreset("star");
        break;
      case "Escape":
        this.followId = null;
        this.pushHud();
        break;
      case "Equal":
      case "NumpadAdd":
        this.setTimeScale(this.timeScale * 1.25);
        break;
      case "Minus":
      case "NumpadSubtract":
        this.setTimeScale(this.timeScale / 1.25);
        break;
      default:
        break;
    }
  }

  private frame = (t: number): void => {
    if (!this.running) return;
    const raw = Math.min(0.1, (t - this.lastT) / 1000);
    this.lastT = t;
    this.stepInput(raw);
    this.stepPhysics(raw);
    this.stepCamera(raw);
    this.trauma = Math.max(0, this.trauma - raw * 2.6);
    const leftover = this.paused ? 1 : this.acc / FIXED_DT;
    const alpha = this.paused ? 1 : Math.min(1, leftover);
    this.draw(t / 1000, alpha);
    this.hudClock += raw;
    if (this.hudClock > 0.2) {
      this.hudClock = 0;
      this.pushHud();
    }
    this.raf = requestAnimationFrame(this.frame);
  };

  private stepInput(dt: number): void {
    const speed = (460 / Math.max(this.camera.zoom, 0.2)) * dt;
    let dx = 0;
    let dy = 0;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) dx -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) dx += 1;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) dy -= 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) dy += 1;
    if (dx || dy) {
      this.followId = null;
      const m = Math.hypot(dx, dy) || 1;
      this.camTarget.x += (dx / m) * speed;
      this.camTarget.y += (dy / m) * speed;
    }
  }

  private stepPhysics(dt: number): void {
    if (this.paused) {
      markFrameStart(this.bodies);
      stepParticles(this.particles, dt);
      return;
    }
    markFrameStart(this.bodies);
    this.acc += dt * this.timeScale;
    this.acc = Math.min(this.acc, 0.22);
    let guard = 0;
    const events: MergeEvent[] = [];
    while (this.acc >= FIXED_DT && guard < 16) {
      const minSep = closestSep(this.bodies);
      const sub = minSep < 40 ? 4 : minSep < 90 ? 2 : 1;
      const h = FIXED_DT / sub;
      for (let i = 0; i < sub; i++) {
        this.bodies = leapfrog(this.bodies, h, events);
      }
      this.trailTick += 1;
      advanceTrails(this.bodies, 2, this.trailTick);
      decayPops(this.bodies, FIXED_DT);
      this.acc -= FIXED_DT;
      guard += 1;
    }
    this.bodies = cullEscaped(this.bodies, this.camera.x, this.camera.y);
    if (this.followId != null && !this.bodies.some((b) => b.id === this.followId)) {
      const last = events[events.length - 1];
      this.followId = last?.id ?? null;
    }
    for (const ev of events) {
      const intensity = Math.min(1, (ev.mass * 0.002 + ev.speed * 0.004) * 0.6);
      this.trauma = Math.min(1, this.trauma + 0.22 + intensity * 0.55);
      spawnParticles(this.particles, ev.x, ev.y, ev.color, 10 + Math.floor(intensity * 18), 40 + intensity * 120);
      this.audio.merge(0.35 + intensity);
    }
    stepParticles(this.particles, dt);
  }

  private stepCamera(dt: number): void {
    const follow = this.followId != null ? this.bodies.find((b) => b.id === this.followId) : null;
    if (follow) {
      this.camTarget.x = follow.x;
      this.camTarget.y = follow.y;
    }
    const k = 1 - Math.exp(-7.5 * dt);
    this.camera.x += (this.camTarget.x - this.camera.x) * k;
    this.camera.y += (this.camTarget.y - this.camera.y) * k;
    this.camera.zoom += (this.camTarget.zoom - this.camera.zoom) * k;
  }

  private draw(time: number, alpha: number): void {
    this.noiseT += 0.08;
    const shakeAmt = this.reduced ? 0 : this.trauma * this.trauma;
    const shake = {
      x: (hash(this.noiseT) - 0.5) * shakeAmt * 14,
      y: (hash(this.noiseT + 17) - 0.5) * shakeAmt * 14,
    };
    drawScene(
      this.ctx,
      this.width,
      this.height,
      this.camera,
      this.bodies,
      this.particles,
      this.stars,
      this.trails,
      this.fling,
      this.ghost,
      this.hoverId,
      this.followId,
      shake,
      time,
      alpha,
      this.reduced,
    );
  }
}

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

function hash(t: number): number {
  const s = Math.sin(t * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

function closestSep(bodies: Body[]): number {
  let min = Infinity;
  for (let i = 0; i < bodies.length; i++) {
    const a = bodies[i]!;
    for (let j = i + 1; j < bodies.length; j++) {
      const b = bodies[j]!;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < min) min = d;
    }
  }
  return min;
}

let simSingleton: Simulation | null = null;

export function getSim(): Simulation | null {
  return simSingleton;
}

export function setSim(sim: Simulation | null): void {
  simSingleton = sim;
  if (typeof window !== "undefined") {
    (window as Window & { __kepler?: unknown }).__kepler = sim
      ? {
          bodyCount: () => sim.bodies.length,
          paused: () => sim.paused,
          scenario: () => sim.scenario,
        }
      : undefined;
  }
}
