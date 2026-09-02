import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, r as Slot, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as Spline, c as Info, l as Crosshair, n as VolumeX, o as Play, r as Volume2, s as Pause, t as X, u as Circle } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DsLny0AE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none transition-[color,background-color,opacity,transform] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:bg-fg",
			secondary: "border border-border bg-surface-2 text-fg hover:bg-surface",
			ghost: "text-muted hover:bg-surface-2 hover:text-fg",
			quiet: "text-muted hover:text-fg"
		},
		size: {
			sm: "h-11 rounded-sm px-3 text-sm",
			md: "h-11 rounded-sm px-4 text-sm",
			icon: "size-11 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "ghost",
		size: "sm"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Slider({ value, min, max, step = .05, onValueChange, label, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		value: [value],
		min,
		max,
		step,
		onValueChange: (v) => onValueChange(v[0] ?? value),
		"aria-label": label,
		className: cn("relative flex h-11 w-full touch-none items-center", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1 w-full grow rounded-full bg-surface-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full rounded-full bg-accent" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-4 rounded-full bg-fg shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-bg)_55%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" })]
	});
}
var FIXED_DT = 1 / 120;
var MASS_PRESETS = [
	{
		id: "dust",
		label: "Dust",
		mass: 2.2,
		kind: "dust"
	},
	{
		id: "moon",
		label: "Moon",
		mass: 11,
		kind: "moon"
	},
	{
		id: "planet",
		label: "Planet",
		mass: 46,
		kind: "planet"
	},
	{
		id: "giant",
		label: "Giant",
		mass: 240,
		kind: "giant"
	},
	{
		id: "star",
		label: "Star",
		mass: 6400,
		kind: "star"
	}
];
var KIND_COLOR = {
	dust: [
		132,
		128,
		122
	],
	moon: [
		196,
		192,
		184
	],
	planet: [
		118,
		142,
		144
	],
	giant: [
		148,
		138,
		128
	],
	star: [
		236,
		230,
		218
	]
};
var KIND_DENSITY = {
	dust: 3.4,
	moon: 3.9,
	planet: 4.05,
	giant: 4.55,
	star: 2.55
};
var SCENARIOS = [
	{
		id: "helios",
		label: "Helios"
	},
	{
		id: "binary",
		label: "Binary"
	},
	{
		id: "figure8",
		label: "Figure 8"
	},
	{
		id: "empty",
		label: "Empty"
	}
];
var SimAudio = class {
	ctx = null;
	master = null;
	muted = false;
	unlock() {
		if (this.ctx) {
			if (this.ctx.state === "suspended") this.ctx.resume();
			return;
		}
		const AC = window.AudioContext || window.webkitAudioContext;
		if (!AC) return;
		this.ctx = new AC({ latencyHint: "interactive" });
		this.master = this.ctx.createGain();
		this.master.gain.value = this.muted ? 0 : .22;
		this.master.connect(this.ctx.destination);
		if (this.ctx.state === "suspended") this.ctx.resume();
	}
	setMuted(muted) {
		this.muted = muted;
		const ctx = this.ctx;
		const master = this.master;
		if (!ctx || !master) return;
		const target = muted ? 0 : .22;
		master.gain.setTargetAtTime(target, ctx.currentTime, .03);
	}
	noise(duration) {
		const ctx = this.ctx;
		if (!ctx) return null;
		const n = Math.floor(ctx.sampleRate * duration);
		const buf = ctx.createBuffer(1, n, ctx.sampleRate);
		const data = buf.getChannelData(0);
		for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
		return buf;
	}
	fling(speed) {
		const ctx = this.ctx;
		const master = this.master;
		if (!ctx || !master || this.muted) return;
		const t = ctx.currentTime;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		const filter = ctx.createBiquadFilter();
		osc.type = "triangle";
		const f = 180 + Math.min(420, speed * 1.4);
		osc.frequency.setValueAtTime(f, t);
		osc.frequency.exponentialRampToValueAtTime(Math.max(80, f * .45), t + .18);
		filter.type = "lowpass";
		filter.frequency.value = 1400;
		gain.gain.setValueAtTime(1e-4, t);
		gain.gain.exponentialRampToValueAtTime(.18, t + .02);
		gain.gain.exponentialRampToValueAtTime(1e-4, t + .22);
		osc.connect(filter);
		filter.connect(gain);
		gain.connect(master);
		osc.start(t);
		osc.stop(t + .24);
		osc.onended = () => {
			osc.disconnect();
			filter.disconnect();
			gain.disconnect();
		};
	}
	merge(intensity) {
		const ctx = this.ctx;
		const master = this.master;
		if (!ctx || !master || this.muted) return;
		const t = ctx.currentTime;
		const mag = Math.min(1, intensity);
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.setValueAtTime(70 + mag * 40, t);
		osc.frequency.exponentialRampToValueAtTime(32, t + .28);
		gain.gain.setValueAtTime(1e-4, t);
		gain.gain.exponentialRampToValueAtTime(.22 * mag, t + .012);
		gain.gain.exponentialRampToValueAtTime(1e-4, t + .32);
		osc.connect(gain);
		gain.connect(master);
		osc.start(t);
		osc.stop(t + .34);
		const buf = this.noise(.16);
		if (buf) {
			const src = ctx.createBufferSource();
			src.buffer = buf;
			const ng = ctx.createGain();
			const bp = ctx.createBiquadFilter();
			bp.type = "bandpass";
			bp.frequency.value = 420;
			bp.Q.value = .7;
			ng.gain.setValueAtTime(.12 * mag, t);
			ng.gain.exponentialRampToValueAtTime(1e-4, t + .14);
			src.connect(bp);
			bp.connect(ng);
			ng.connect(master);
			src.start(t);
			src.stop(t + .16);
		}
		osc.onended = () => {
			osc.disconnect();
			gain.disconnect();
		};
	}
};
var nextId = 1;
function radiusFromMass(mass, kind) {
	return Math.max(2.4, KIND_DENSITY[kind] * Math.cbrt(Math.max(mass, .2)));
}
function kindFromMass(mass, preferred) {
	if (preferred === "star" || mass >= 900) return "star";
	if (mass >= 140) return "giant";
	if (mass >= 22) return "planet";
	if (mass >= 5) return "moon";
	return "dust";
}
function mixRgb(a, b, t) {
	const u = 1 - t;
	return [
		Math.round(a[0] * u + b[0] * t),
		Math.round(a[1] * u + b[1] * t),
		Math.round(a[2] * u + b[2] * t)
	];
}
function createBody(seed) {
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
		trailX: /* @__PURE__ */ new Float32Array(720),
		trailY: /* @__PURE__ */ new Float32Array(720),
		trailHead: 0,
		trailCount: 0,
		held: false,
		pop: 1
	};
}
function recordTrail(body) {
	body.trailX[body.trailHead] = body.x;
	body.trailY[body.trailHead] = body.y;
	body.trailHead = (body.trailHead + 1) % 720;
	if (body.trailCount < 720) body.trailCount += 1;
}
function circularSpeed(parentMass, distance) {
	return Math.sqrt(280 * parentMass / Math.max(distance, 1));
}
function orbitVelocity(parent, x, y, prograde = 1) {
	const dx = x - parent.x;
	const dy = y - parent.y;
	const dist = Math.hypot(dx, dy) || 1;
	const speed = circularSpeed(parent.mass, dist) * prograde;
	return {
		vx: parent.vx - dy / dist * speed,
		vy: parent.vy + dx / dist * speed
	};
}
function combineKind(a, b, mass) {
	if (a.kind === "star" || b.kind === "star") return "star";
	return kindFromMass(mass);
}
function mergePair(keep, drop) {
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
function computeForces(bodies) {
	const n = bodies.length;
	for (let i = 0; i < n; i++) {
		const b = bodies[i];
		b.ax = 0;
		b.ay = 0;
	}
	let minSep = Infinity;
	for (let i = 0; i < n; i++) {
		const a = bodies[i];
		for (let j = i + 1; j < n; j++) {
			const b = bodies[j];
			const dx = b.x - a.x;
			const dy = b.y - a.y;
			const r2 = dx * dx + dy * dy;
			const dist = Math.sqrt(r2);
			const touch = a.radius + b.radius;
			if (dist < minSep) minSep = dist;
			const eps = .06 * touch;
			const soft = r2 + eps * eps;
			const s = 280 * (1 / (soft * Math.sqrt(soft)));
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
function resolveMerges(bodies, events) {
	let list = bodies;
	let changed = true;
	while (changed) {
		changed = false;
		outer: for (let i = 0; i < list.length; i++) {
			const a = list[i];
			if (a.held) continue;
			for (let j = i + 1; j < list.length; j++) {
				const b = list[j];
				if (b.held) continue;
				const dx = b.x - a.x;
				const dy = b.y - a.y;
				const limit = (a.radius + b.radius) * .9;
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
					id: keep.id
				});
				list = list.filter((body) => body !== drop);
				changed = true;
				break outer;
			}
		}
	}
	return list;
}
function leapfrog(bodies, dt, events) {
	const n = bodies.length;
	for (let i = 0; i < n; i++) {
		const b = bodies[i];
		if (b.held) continue;
		b.vx += b.ax * dt * .5;
		b.vy += b.ay * dt * .5;
		b.x += b.vx * dt;
		b.y += b.vy * dt;
	}
	computeForces(bodies);
	for (let i = 0; i < n; i++) {
		const b = bodies[i];
		if (b.held) continue;
		b.vx += b.ax * dt * .5;
		b.vy += b.ay * dt * .5;
		const speed = Math.hypot(b.vx, b.vy);
		if (speed > 2800) {
			const s = 2800 / speed;
			b.vx *= s;
			b.vy *= s;
		}
	}
	return resolveMerges(bodies, events);
}
function markFrameStart(bodies) {
	for (let i = 0; i < bodies.length; i++) {
		const b = bodies[i];
		b.ix = b.x;
		b.iy = b.y;
	}
}
function advanceTrails(bodies, cadence, tick) {
	if (tick % cadence !== 0) return;
	for (let i = 0; i < bodies.length; i++) recordTrail(bodies[i]);
}
function decayPops(bodies, dt) {
	for (let i = 0; i < bodies.length; i++) {
		const b = bodies[i];
		if (b.pop > 1) {
			b.pop = 1 + (b.pop - 1) * Math.exp(-10 * dt);
			if (b.pop < 1.01) b.pop = 1;
		}
	}
}
function cullEscaped(bodies, originX, originY) {
	const limit2 = 324e6;
	return bodies.filter((b) => {
		const dx = b.x - originX;
		const dy = b.y - originY;
		return dx * dx + dy * dy < limit2;
	});
}
function predictPath(bodies, spawn, seconds) {
	const n = bodies.length + 1;
	const xs = new Float64Array(n);
	const ys = new Float64Array(n);
	const vxs = new Float64Array(n);
	const vys = new Float64Array(n);
	const mass = new Float64Array(n);
	const rad = new Float64Array(n);
	for (let i = 0; i < bodies.length; i++) {
		const b = bodies[i];
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
		for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
			const dx = xs[j] - xs[i];
			const dy = ys[j] - ys[i];
			const r2 = dx * dx + dy * dy + 16;
			const k = 280 * (1 / (r2 * Math.sqrt(r2)));
			const fx = dx * k;
			const fy = dy * k;
			ax[i] += fx * mass[j];
			ay[i] += fy * mass[j];
			ax[j] -= fx * mass[i];
			ay[j] -= fy * mass[i];
		}
	};
	forces();
	for (let step = 0; step < steps; step++) {
		for (let i = 0; i < n; i++) {
			vxs[i] += ax[i] * dt * .5;
			vys[i] += ay[i] * dt * .5;
			xs[i] += vxs[i] * dt;
			ys[i] += vys[i] * dt;
		}
		forces();
		for (let i = 0; i < n; i++) {
			vxs[i] += ax[i] * dt * .5;
			vys[i] += ay[i] * dt * .5;
		}
		px[count] = xs[s];
		py[count] = ys[s];
		count++;
		for (let i = 0; i < s; i++) {
			const dx = xs[s] - xs[i];
			const dy = ys[s] - ys[i];
			const lim = (rad[s] + rad[i]) * .9;
			if (dx * dx + dy * dy < lim * lim) return {
				x: px,
				y: py,
				count
			};
		}
	}
	return {
		x: px,
		y: py,
		count
	};
}
function spawnParticles(particles, x, y, color, count, speed) {
	const n = Math.min(count, 36);
	for (let i = 0; i < n; i++) {
		const ang = Math.PI * 2 * i / n + Math.random() * .4;
		const mag = speed * (.35 + Math.random() * .9);
		particles.push({
			x,
			y,
			vx: Math.cos(ang) * mag,
			vy: Math.sin(ang) * mag,
			life: 1,
			maxLife: .35 + Math.random() * .55,
			size: 1.2 + Math.random() * 2.4,
			color
		});
	}
}
function stepParticles(particles, dt) {
	for (let i = particles.length - 1; i >= 0; i--) {
		const p = particles[i];
		p.life -= dt / p.maxLife;
		p.x += p.vx * dt;
		p.y += p.vy * dt;
		p.vx *= Math.exp(-1.8 * dt);
		p.vy *= Math.exp(-1.8 * dt);
		if (p.life <= 0) particles.splice(i, 1);
	}
}
function makeStars(count) {
	const stars = [];
	for (let i = 0; i < count; i++) stars.push({
		x: Math.random(),
		y: Math.random(),
		r: Math.random() < .86 ? .6 + Math.random() * .8 : 1.2 + Math.random() * 1.1,
		a: .18 + Math.random() * .55,
		layer: Math.random() < .5 ? 0 : 1
	});
	return stars;
}
function worldToScreen(wx, wy, cam, w, h) {
	return {
		x: (wx - cam.x) * cam.zoom + w * .5,
		y: (wy - cam.y) * cam.zoom + h * .5
	};
}
function screenToWorld(sx, sy, cam, w, h) {
	return {
		x: (sx - w * .5) / cam.zoom + cam.x,
		y: (sy - h * .5) / cam.zoom + cam.y
	};
}
function rgba(c, a) {
	return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}
function lerp(a, b, t) {
	return a + (b - a) * t;
}
function drawScene(ctx, w, h, cam, bodies, particles, stars, trailsOn, fling, ghost, hoverId, followId, shake, time, alpha, reduced) {
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, w, h);
	ctx.fillStyle = "#08090b";
	ctx.fillRect(0, 0, w, h);
	const wash = ctx.createRadialGradient(w * .5, h * .42, 40, w * .5, h * .5, Math.max(w, h) * .72);
	wash.addColorStop(0, "rgba(18, 20, 26, 0.9)");
	wash.addColorStop(1, "rgba(8, 9, 11, 0)");
	ctx.fillStyle = wash;
	ctx.fillRect(0, 0, w, h);
	ctx.save();
	ctx.translate(shake.x, shake.y);
	drawStars(ctx, w, h, cam, stars, time, reduced);
	if (trailsOn) drawTrails(ctx, bodies, cam, w, h, alpha);
	if (ghost && ghost.count > 1) drawGhost(ctx, ghost, cam, w, h);
	drawParticles(ctx, particles, cam, w, h);
	drawBodies(ctx, bodies, cam, w, h, hoverId, followId, alpha);
	if (fling) drawFling(ctx, fling, bodies, cam, w, h);
	ctx.restore();
	const vig = ctx.createRadialGradient(w * .5, h * .5, Math.min(w, h) * .38, w * .5, h * .5, Math.max(w, h) * .72);
	vig.addColorStop(0, "rgba(0,0,0,0)");
	vig.addColorStop(1, "rgba(0,0,0,0.38)");
	ctx.fillStyle = vig;
	ctx.fillRect(0, 0, w, h);
}
function drawStars(ctx, w, h, cam, stars, time, reduced) {
	for (const s of stars) {
		const parallax = s.layer === 0 ? .04 : .09;
		const px = ((s.x * w - cam.x * parallax) % w + w) % w;
		const py = ((s.y * h - cam.y * parallax) % h + h) % h;
		const tw = reduced ? 1 : .75 + .25 * Math.sin(time * (.6 + s.a) + s.x * 12);
		ctx.beginPath();
		ctx.fillStyle = `rgba(236,236,232,${s.a * tw})`;
		ctx.arc(px, py, s.r, 0, Math.PI * 2);
		ctx.fill();
	}
}
function drawTrails(ctx, bodies, cam, w, h, alpha) {
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	for (const b of bodies) {
		if (b.trailCount < 2) continue;
		const z = cam.zoom;
		ctx.lineWidth = Math.max(1, Math.min(4.5, b.radius * .18 * z));
		const n = b.trailCount;
		const chunk = Math.max(2, Math.floor(n / 12));
		for (let c = 0; c < n - 1; c += chunk) {
			const end = Math.min(n - 1, c + chunk);
			const fade = c / n * .55 + .05;
			ctx.strokeStyle = rgba(b.color, fade);
			ctx.beginPath();
			for (let i = c; i <= end; i++) {
				const idx = (b.trailHead - n + i + 720) % 720;
				const s = worldToScreen(i === n - 1 ? lerp(b.ix, b.x, alpha) : b.trailX[idx], i === n - 1 ? lerp(b.iy, b.y, alpha) : b.trailY[idx], cam, w, h);
				if (i === c) ctx.moveTo(s.x, s.y);
				else ctx.lineTo(s.x, s.y);
			}
			ctx.stroke();
		}
	}
}
function drawGhost(ctx, ghost, cam, w, h) {
	ctx.beginPath();
	ctx.setLineDash([5, 6]);
	ctx.strokeStyle = "rgba(197, 205, 214, 0.55)";
	ctx.lineWidth = 1.25;
	for (let i = 0; i < ghost.count; i++) {
		const s = worldToScreen(ghost.x[i], ghost.y[i], cam, w, h);
		if (i === 0) ctx.moveTo(s.x, s.y);
		else ctx.lineTo(s.x, s.y);
	}
	ctx.stroke();
	ctx.setLineDash([]);
}
function drawParticles(ctx, particles, cam, w, h) {
	for (const p of particles) {
		const s = worldToScreen(p.x, p.y, cam, w, h);
		ctx.beginPath();
		ctx.fillStyle = rgba(p.color, Math.max(0, p.life) * .9);
		ctx.arc(s.x, s.y, Math.max(.6, p.size * cam.zoom), 0, Math.PI * 2);
		ctx.fill();
	}
}
function lightDir(bodies, body) {
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
	if (wsum < 1e-8) return {
		x: -.45,
		y: -.55
	};
	const m = Math.hypot(lx, ly) || 1;
	return {
		x: lx / m,
		y: ly / m
	};
}
function drawBodies(ctx, bodies, cam, w, h, hoverId, followId, alpha) {
	const ordered = bodies.slice().sort((a, b) => b.mass - a.mass);
	for (const b of ordered) {
		const s = worldToScreen(lerp(b.ix, b.x, alpha), lerp(b.iy, b.y, alpha), cam, w, h);
		const r = Math.max(1.2, b.radius * b.pop * cam.zoom);
		if (s.x < -r * 4 || s.y < -r * 4 || s.x > w + r * 4 || s.y > h + r * 4) continue;
		const glowR = r * (b.kind === "star" ? 3.4 : 2.1);
		const glow = ctx.createRadialGradient(s.x, s.y, r * .2, s.x, s.y, glowR);
		const ga = b.kind === "star" ? .42 : .16;
		glow.addColorStop(0, rgba(b.color, ga));
		glow.addColorStop(1, rgba(b.color, 0));
		ctx.fillStyle = glow;
		ctx.beginPath();
		ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
		ctx.fill();
		const L = lightDir(bodies, b);
		const hx = s.x - L.x * r * .35;
		const hy = s.y - L.y * r * .35;
		const g = ctx.createRadialGradient(hx, hy, r * .08, s.x, s.y, r);
		const c = b.color;
		g.addColorStop(0, `rgb(${Math.min(255, c[0] + 48)},${Math.min(255, c[1] + 44)},${Math.min(255, c[2] + 36)})`);
		g.addColorStop(.45, rgba(c, 1));
		g.addColorStop(1, `rgb(${Math.max(0, c[0] * .28)},${Math.max(0, c[1] * .28)},${Math.max(0, c[2] * .3)})`);
		ctx.beginPath();
		ctx.fillStyle = g;
		ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
		ctx.fill();
		if (b.kind === "star") {
			const core = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * .55);
			core.addColorStop(0, "rgba(255,252,246,0.85)");
			core.addColorStop(1, "rgba(255,252,246,0)");
			ctx.fillStyle = core;
			ctx.beginPath();
			ctx.arc(s.x, s.y, r * .55, 0, Math.PI * 2);
			ctx.fill();
		}
		if (b.id === hoverId || b.id === followId) {
			ctx.beginPath();
			ctx.strokeStyle = b.id === followId ? "rgba(236,236,232,0.7)" : "rgba(197,205,214,0.55)";
			ctx.lineWidth = 1.25;
			ctx.arc(s.x, s.y, r + 5, 0, Math.PI * 2);
			ctx.stroke();
		}
	}
}
function drawFling(ctx, fling, bodies, cam, w, h) {
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
	ctx.lineTo(end.x - Math.cos(ang - .45) * ah, end.y - Math.sin(ang - .45) * ah);
	ctx.lineTo(end.x - Math.cos(ang + .45) * ah, end.y - Math.sin(ang + .45) * ah);
	ctx.closePath();
	ctx.fillStyle = "rgba(236, 236, 232, 0.85)";
	ctx.fill();
	const r = ((fling.bodyId != null ? bodies.find((b) => b.id === fling.bodyId) : null)?.radius ?? 12) * cam.zoom;
	ctx.beginPath();
	ctx.strokeStyle = "rgba(197, 205, 214, 0.7)";
	ctx.setLineDash([3, 3]);
	ctx.arc(origin.x, origin.y, Math.max(4, r), 0, Math.PI * 2);
	ctx.stroke();
	ctx.setLineDash([]);
}
function seedToBodies(seeds) {
	return seeds.map((s) => createBody(s));
}
function around(parent, distance, angle, mass, kind, color) {
	const x = parent.x + Math.cos(angle) * distance;
	const y = parent.y + Math.sin(angle) * distance;
	const v = orbitVelocity(parent, x, y);
	return {
		x,
		y,
		vx: v.vx,
		vy: v.vy,
		mass,
		kind,
		color
	};
}
function scenarioHelios() {
	const star = {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		mass: 7200,
		kind: "star",
		color: [
			238,
			232,
			220
		]
	};
	const inner = around(star, 260, -.4, 16, "moon", [
		186,
		168,
		150
	]);
	const ocean = around(star, 420, 1.15, 110, "planet", [
		112,
		140,
		146
	]);
	const moon = around(ocean, radiusFromMass(ocean.mass, "planet") + radiusFromMass(6, "moon") + 12, .55, 6, "moon", [
		200,
		196,
		188
	]);
	const giant = around(star, 660, 2.5, 280, "giant", [
		150,
		136,
		122
	]);
	const ice = around(star, 880, 4.1, 28, "planet", [
		154,
		170,
		182
	]);
	const comet = around(star, 1180, -1.15, 3.2, "dust", [
		176,
		178,
		184
	]);
	comet.vx *= .88;
	comet.vy *= .88;
	return seedToBodies([
		star,
		inner,
		ocean,
		moon,
		giant,
		ice,
		comet
	]);
}
function scenarioBinary() {
	const d = 118;
	const m = 3100;
	const v = .5 * Math.sqrt(1736e3 / 236);
	const a = {
		x: -118,
		y: 0,
		vx: 0,
		vy: v,
		mass: m,
		kind: "star",
		color: [
			236,
			228,
			214
		]
	};
	const b = {
		x: d,
		y: 0,
		vx: 0,
		vy: -v,
		mass: m,
		kind: "star",
		color: [
			210,
			216,
			224
		]
	};
	const com = {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		mass: m * 2,
		kind: "star"
	};
	return seedToBodies([
		a,
		b,
		around(com, 420, .9, 52, "planet", [
			120,
			138,
			148
		]),
		around(com, 250, 3.4, 18, "moon", [
			176,
			160,
			148
		])
	]);
}
function scenarioFigure8() {
	const S = 70;
	const mass = 200;
	const radius = 7.2;
	const vScale = Math.sqrt(280 * mass / S);
	const p1x = .970004356697046 * S;
	const p1y = -.243087532909274 * S;
	const v1x = .466203685 * vScale;
	const v1y = .43236573 * vScale;
	const color = [
		[
			168,
			176,
			184
		],
		[
			196,
			186,
			172
		],
		[
			148,
			160,
			166
		]
	];
	return seedToBodies([
		{
			x: p1x,
			y: p1y,
			vx: v1x,
			vy: v1y,
			mass,
			kind: "moon",
			color: color[0],
			radius
		},
		{
			x: -67.90030496879322,
			y: 17.01612730364918,
			vx: v1x,
			vy: v1y,
			mass,
			kind: "moon",
			color: color[1],
			radius
		},
		{
			x: 0,
			y: 0,
			vx: -2 * v1x,
			vy: -2 * v1y,
			mass,
			kind: "moon",
			color: color[2],
			radius
		}
	]);
}
function loadScenario(id) {
	switch (id) {
		case "binary": return scenarioBinary();
		case "figure8": return scenarioFigure8();
		case "empty": return [];
		default: return scenarioHelios();
	}
}
function fitCamera(bodies) {
	if (bodies.length === 0) return {
		x: 0,
		y: 0,
		zoom: .85
	};
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	for (const b of bodies) {
		const pad = b.radius * 6;
		minX = Math.min(minX, b.x - pad);
		minY = Math.min(minY, b.y - pad);
		maxX = Math.max(maxX, b.x + pad);
		maxY = Math.max(maxY, b.y + pad);
	}
	const w = Math.max(280, maxX - minX);
	const h = Math.max(280, maxY - minY);
	const zoom = Math.min(1.35, Math.max(.28, .72 / (Math.max(w, h) / 780)));
	return {
		x: (minX + maxX) / 2,
		y: (minY + maxY) / 2,
		zoom
	};
}
var useSimStore = create((set) => ({
	ready: false,
	paused: false,
	timeScale: 1,
	trails: true,
	muted: false,
	massPreset: "planet",
	bodyCount: 0,
	scenario: "helios",
	following: false,
	showHelp: true,
	patch: (partial) => set(partial)
}));
var THROW_TIME = .38;
var ZOOM_MIN = .12;
var ZOOM_MAX = 3.6;
var LS_KEY = "kepler-prefs-v1";
function readPrefs() {
	try {
		const raw = localStorage.getItem(LS_KEY);
		if (!raw) return {};
		return JSON.parse(raw);
	} catch {
		return {};
	}
}
function writePrefs(p) {
	try {
		localStorage.setItem(LS_KEY, JSON.stringify(p));
	} catch {}
}
var Simulation = class {
	bodies = [];
	particles = [];
	camera = {
		x: 0,
		y: 0,
		zoom: .85
	};
	camTarget = {
		x: 0,
		y: 0,
		zoom: .85
	};
	paused = false;
	timeScale = 1;
	trails = true;
	massPreset = "planet";
	scenario = "helios";
	followId = null;
	hoverId = null;
	showHelp = true;
	width = 1;
	height = 1;
	canvas;
	ctx;
	audio = new SimAudio();
	stars = makeStars(160);
	keys = /* @__PURE__ */ new Set();
	pointers = /* @__PURE__ */ new Map();
	fling = null;
	pan = null;
	pinch = null;
	ghost = null;
	ghostAt = 0;
	acc = 0;
	lastT = 0;
	raf = 0;
	trailTick = 0;
	trauma = 0;
	reduced = false;
	running = false;
	unsubs = [];
	hudClock = 0;
	noiseT = 0;
	constructor(canvas) {
		this.canvas = canvas;
		const ctx = canvas.getContext("2d", {
			alpha: false,
			desynchronized: true
		});
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
	start() {
		if (this.running) return;
		this.running = true;
		this.bind();
		this.lastT = performance.now();
		this.raf = requestAnimationFrame(this.frame);
		this.pushHud();
	}
	stop() {
		this.running = false;
		cancelAnimationFrame(this.raf);
		for (const off of this.unsubs) off();
		this.unsubs = [];
		this.keys.clear();
		this.pointers.clear();
	}
	resize(cssW, cssH, dpr) {
		this.width = cssW;
		this.height = cssH;
		this.canvas.width = Math.max(1, Math.floor(cssW * dpr));
		this.canvas.height = Math.max(1, Math.floor(cssH * dpr));
		this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}
	load(id) {
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
		if (id === "empty") this.camTarget.zoom = Math.min(this.camTarget.zoom, .9);
		this.pushHud();
	}
	clear() {
		this.bodies = [];
		this.particles.length = 0;
		this.followId = null;
		this.fling = null;
		this.ghost = null;
		this.pushHud();
	}
	togglePause() {
		this.paused = !this.paused;
		this.pushHud();
	}
	setTimeScale(v) {
		this.timeScale = Math.min(4, Math.max(.15, v));
		this.persist();
		this.pushHud();
	}
	setTrails(on) {
		this.trails = on;
		this.persist();
		this.pushHud();
	}
	setMuted(on) {
		this.audio.setMuted(on);
		this.persist();
		this.pushHud();
	}
	setMassPreset(id) {
		this.massPreset = id;
		this.persist();
		this.pushHud();
	}
	dismissHelp() {
		this.showHelp = false;
		this.persist();
		this.pushHud();
	}
	persist() {
		writePrefs({
			trails: this.trails,
			muted: this.audio.muted,
			timeScale: this.timeScale,
			massPreset: this.massPreset,
			help: this.showHelp
		});
	}
	pushHud() {
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
			showHelp: this.showHelp
		});
	}
	bind() {
		const c = this.canvas;
		const add = (el, type, fn, opts) => {
			el.addEventListener(type, fn, opts);
			this.unsubs.push(() => el.removeEventListener(type, fn, opts));
		};
		add(c, "pointerdown", (e) => this.onPointerDown(e));
		add(c, "pointermove", (e) => this.onPointerMove(e));
		add(c, "pointerup", (e) => this.onPointerUp(e));
		add(c, "pointercancel", (e) => this.onPointerUp(e));
		add(c, "wheel", (e) => this.onWheel(e), { passive: false });
		add(c, "contextmenu", (e) => e.preventDefault());
		add(window, "keydown", (e) => this.onKey(e, true));
		add(window, "keyup", (e) => this.onKey(e, false));
		add(window, "blur", () => this.keys.clear());
		add(document, "visibilitychange", () => {
			if (document.hidden) this.keys.clear();
			else this.audio.unlock();
		});
	}
	clientToCanvas(e) {
		const r = this.canvas.getBoundingClientRect();
		return {
			x: e.clientX - r.left,
			y: e.clientY - r.top
		};
	}
	hitBody(wx, wy) {
		const slop = 10 / this.camera.zoom;
		let best = null;
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
	onPointerDown(e) {
		this.audio.unlock();
		const p = this.clientToCanvas(e);
		this.pointers.set(e.pointerId, p);
		try {
			this.canvas.setPointerCapture(e.pointerId);
		} catch {}
		if (this.pointers.size === 2) {
			if (this.fling?.bodyId != null) {
				const held = this.bodies.find((b) => b.id === this.fling.bodyId);
				if (held) held.held = false;
			}
			this.fling = null;
			this.pan = null;
			const ids = [...this.pointers.keys()];
			const pts = [...this.pointers.values()];
			const a = pts[0];
			const b = pts[1];
			this.pinch = {
				a: ids[0],
				b: ids[1],
				lastDist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
				lastMidX: (a.x + b.x) * .5,
				lastMidY: (a.y + b.y) * .5
			};
			return;
		}
		if (e.button === 1 || e.button === 2) {
			this.pan = {
				pointerId: e.pointerId,
				lastX: p.x,
				lastY: p.y
			};
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
			screenY: p.y
		};
		if (hit) hit.held = true;
	}
	onPointerMove(e) {
		const p = this.clientToCanvas(e);
		this.pointers.set(e.pointerId, p);
		if (this.pinch && this.pointers.size >= 2) {
			const pts = [...this.pointers.values()];
			const a = pts[0];
			const b = pts[1];
			const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
			const midX = (a.x + b.x) * .5;
			const midY = (a.y + b.y) * .5;
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
			const body = this.fling.bodyId != null ? this.bodies.find((b) => b.id === this.fling.bodyId) : null;
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
	onPointerUp(e) {
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
	commitFling(x, y) {
		const f = this.fling;
		this.fling = null;
		this.ghost = null;
		if (!f) return;
		const dx = x - f.startX;
		const dy = y - f.startY;
		const dist = Math.hypot(dx, dy);
		const vx = dx / THROW_TIME;
		const vy = dy / THROW_TIME;
		const preset = MASS_PRESETS.find((m) => m.id === this.massPreset) ?? MASS_PRESETS[2];
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
		if (this.bodies.length >= 48) return;
		const body = createBody({
			x: f.startX,
			y: f.startY,
			vx: dist < 6 / this.camera.zoom ? 0 : vx,
			vy: dist < 6 / this.camera.zoom ? 0 : vy,
			mass: preset.mass,
			kind: preset.kind
		});
		this.bodies.push(body);
		this.audio.fling(Math.hypot(body.vx, body.vy));
		this.pushHud();
	}
	maybePredict() {
		const now = performance.now();
		if (now - this.ghostAt < 40 || !this.fling) return;
		this.ghostAt = now;
		const f = this.fling;
		const dx = f.curX - f.startX;
		const dy = f.curY - f.startY;
		const existing = f.bodyId != null ? this.bodies.find((b) => b.id === f.bodyId) : null;
		const preset = MASS_PRESETS.find((m) => m.id === this.massPreset) ?? MASS_PRESETS[2];
		const mass = existing?.mass ?? preset.mass;
		const radius = existing?.radius ?? radiusFromMass(mass, existing?.kind ?? preset.kind);
		const others = existing ? this.bodies.filter((b) => b !== existing) : this.bodies;
		this.ghost = predictPath(others, {
			x: f.startX,
			y: f.startY,
			vx: dx / THROW_TIME,
			vy: dy / THROW_TIME,
			mass,
			radius
		}, others.length > 18 ? 2.2 : 3.6);
	}
	onWheel(e) {
		e.preventDefault();
		const p = this.clientToCanvas(e);
		const before = screenToWorld(p.x, p.y, this.camera, this.width, this.height);
		const factor = Math.exp(-e.deltaY * .00115);
		this.camTarget.zoom = clamp(this.camTarget.zoom * factor, ZOOM_MIN, ZOOM_MAX);
		this.camera.zoom = this.camTarget.zoom;
		const after = screenToWorld(p.x, p.y, this.camera, this.width, this.height);
		this.camera.x += before.x - after.x;
		this.camera.y += before.y - after.y;
		this.camTarget.x = this.camera.x;
		this.camTarget.y = this.camera.y;
		this.followId = this.followId;
	}
	onKey(e, down) {
		const tag = e.target?.tagName;
		if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
		if (down) {
			if ((/* @__PURE__ */ new Set([
				"Space",
				"ArrowLeft",
				"ArrowRight",
				"ArrowUp",
				"ArrowDown",
				"KeyA",
				"KeyD",
				"KeyW",
				"KeyS"
			])).has(e.code)) e.preventDefault();
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
			case "NumpadSubtract": this.setTimeScale(this.timeScale / 1.25);
		}
	}
	frame = (t) => {
		if (!this.running) return;
		const raw = Math.min(.1, (t - this.lastT) / 1e3);
		this.lastT = t;
		this.stepInput(raw);
		this.stepPhysics(raw);
		this.stepCamera(raw);
		this.trauma = Math.max(0, this.trauma - raw * 2.6);
		const leftover = this.paused ? 1 : this.acc / FIXED_DT;
		const alpha = this.paused ? 1 : Math.min(1, leftover);
		this.draw(t / 1e3, alpha);
		this.hudClock += raw;
		if (this.hudClock > .2) {
			this.hudClock = 0;
			this.pushHud();
		}
		this.raf = requestAnimationFrame(this.frame);
	};
	stepInput(dt) {
		const speed = 460 / Math.max(this.camera.zoom, .2) * dt;
		let dx = 0;
		let dy = 0;
		if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) dx -= 1;
		if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) dx += 1;
		if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) dy -= 1;
		if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) dy += 1;
		if (dx || dy) {
			this.followId = null;
			const m = Math.hypot(dx, dy) || 1;
			this.camTarget.x += dx / m * speed;
			this.camTarget.y += dy / m * speed;
		}
	}
	stepPhysics(dt) {
		if (this.paused) {
			markFrameStart(this.bodies);
			stepParticles(this.particles, dt);
			return;
		}
		markFrameStart(this.bodies);
		this.acc += dt * this.timeScale;
		this.acc = Math.min(this.acc, .22);
		let guard = 0;
		const events = [];
		while (this.acc >= .008333333333333333 && guard < 16) {
			const minSep = closestSep(this.bodies);
			const sub = minSep < 40 ? 4 : minSep < 90 ? 2 : 1;
			const h = FIXED_DT / sub;
			for (let i = 0; i < sub; i++) this.bodies = leapfrog(this.bodies, h, events);
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
			const intensity = Math.min(1, (ev.mass * .002 + ev.speed * .004) * .6);
			this.trauma = Math.min(1, this.trauma + .22 + intensity * .55);
			spawnParticles(this.particles, ev.x, ev.y, ev.color, 10 + Math.floor(intensity * 18), 40 + intensity * 120);
			this.audio.merge(.35 + intensity);
		}
		stepParticles(this.particles, dt);
	}
	stepCamera(dt) {
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
	draw(time, alpha) {
		this.noiseT += .08;
		const shakeAmt = this.reduced ? 0 : this.trauma * this.trauma;
		const shake = {
			x: (hash(this.noiseT) - .5) * shakeAmt * 14,
			y: (hash(this.noiseT + 17) - .5) * shakeAmt * 14
		};
		drawScene(this.ctx, this.width, this.height, this.camera, this.bodies, this.particles, this.stars, this.trails, this.fling, this.ghost, this.hoverId, this.followId, shake, time, alpha, this.reduced);
	}
};
function clamp(n, a, b) {
	return Math.max(a, Math.min(b, n));
}
function hash(t) {
	const s = Math.sin(t * 12.9898) * 43758.5453;
	return s - Math.floor(s);
}
function closestSep(bodies) {
	let min = Infinity;
	for (let i = 0; i < bodies.length; i++) {
		const a = bodies[i];
		for (let j = i + 1; j < bodies.length; j++) {
			const b = bodies[j];
			const d = Math.hypot(a.x - b.x, a.y - b.y);
			if (d < min) min = d;
		}
	}
	return min;
}
var simSingleton = null;
function getSim() {
	return simSingleton;
}
function setSim(sim) {
	simSingleton = sim;
	if (typeof window !== "undefined") window.__kepler = sim ? {
		bodyCount: () => sim.bodies.length,
		paused: () => sim.paused,
		scenario: () => sim.scenario
	} : void 0;
}
var PRESET_DOT = {
	dust: "size-1.5",
	moon: "size-2",
	planet: "size-2.5",
	giant: "size-3",
	star: "size-3.5"
};
function Hud() {
	const paused = useSimStore((s) => s.paused);
	const timeScale = useSimStore((s) => s.timeScale);
	const trails = useSimStore((s) => s.trails);
	const muted = useSimStore((s) => s.muted);
	const massPreset = useSimStore((s) => s.massPreset);
	const bodyCount = useSimStore((s) => s.bodyCount);
	const scenario = useSimStore((s) => s.scenario);
	const following = useSimStore((s) => s.following);
	const showHelp = useSimStore((s) => s.showHelp);
	const ready = useSimStore((s) => s.ready);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 sm:p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto max-w-[16rem] rounded-2xl border border-border bg-surface/90 p-3 sm:max-w-none",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl leading-tight tracking-[-0.03em] text-fg italic sm:text-[1.75rem]",
						children: "Kepler"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-muted",
						children: "Orbital sandbox"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-xs tabular-nums text-subtle",
						children: [ready ? `${bodyCount} ${bodyCount === 1 ? "body" : "bodies"}` : "…", following ? " · following" : ""]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto flex items-center gap-1 rounded-2xl border border-border bg-surface/90 p-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": paused ? "Resume" : "Pause",
						"aria-pressed": paused,
						onClick: () => getSim()?.togglePause(),
						children: paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": trails ? "Hide trails" : "Show trails",
						"aria-pressed": trails,
						onClick: () => getSim()?.setTrails(!trails),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spline, { className: cn("size-4", !trails && "opacity-40") })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": muted ? "Unmute" : "Mute",
						"aria-pressed": muted,
						onClick: () => getSim()?.setMuted(!muted),
						children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": following ? "Stop following" : "Follow is off — tap a body",
						"aria-pressed": following,
						onClick: () => {
							const sim = getSim();
							if (!sim || sim.followId == null) return;
							sim.followId = null;
							useSimStore.getState().patch({ following: false });
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: cn("size-4", !following && "opacity-40") })
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [
				showHelp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpCard, {}) : null,
				ready && bodyCount === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pointer-events-none self-center text-center font-display text-xl italic text-fg/80",
					children: "Drag to fling a planet"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-2xl border border-border bg-surface/92 p-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
							children: MASS_PRESETS.map((preset) => {
								const active = massPreset === preset.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									"aria-pressed": active,
									onClick: () => getSim()?.setMassPreset(preset.id),
									className: cn("flex h-11 min-w-16 shrink-0 items-center justify-center gap-2 rounded-sm px-3 text-sm font-medium transition-colors duration-[var(--motion-quick)]", active ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-fg"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("rounded-full bg-current", PRESET_DOT[preset.id]) }), preset.label]
								}, preset.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 px-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 flex-1 items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "w-10 shrink-0 font-mono text-xs tabular-nums text-muted",
									children: [Number(timeScale.toFixed(2)), "×"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
									label: "Time scale",
									value: timeScale,
									min: .15,
									max: 4,
									step: .05,
									onValueChange: (v) => getSim()?.setTimeScale(v)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => getSim()?.clear(),
								children: "Clear"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1 overflow-x-auto px-0.5 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
							children: SCENARIOS.map((item) => {
								const active = scenario === item.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									"aria-pressed": active,
									onClick: () => getSim()?.load(item.id),
									className: cn("flex h-11 shrink-0 items-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors duration-[var(--motion-quick)]", active ? "text-fg" : "text-muted hover:text-fg"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: cn("size-1.5 fill-current", active ? "text-fg" : "text-subtle") }), item.label]
								}, item.id);
							})
						})
					]
				})
			]
		})]
	});
}
function HelpCard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto mx-auto w-full max-w-3xl rounded-2xl border border-border bg-surface/90 p-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					className: "mt-0.5 size-4 shrink-0 text-subtle",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-fg text-pretty",
						children: "Drag to fling a planet. Drag an existing body to throw it. Scroll to zoom, right-drag or two fingers to pan. Tap a body to follow."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 hidden text-xs text-muted sm:block",
						children: "Space pauses · C clears · 1–5 mass · T trails"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "size-9 shrink-0",
					"aria-label": "Dismiss help",
					onClick: () => getSim()?.dismissHelp(),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})
			]
		})
	});
}
function SimCanvas() {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const sim = new Simulation(canvas);
		setSim(sim);
		const fit = () => {
			const rect = (canvas.parentElement ?? canvas).getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			sim.resize(rect.width, rect.height, dpr);
		};
		fit();
		sim.start();
		const ro = new ResizeObserver(fit);
		ro.observe(canvas.parentElement ?? canvas);
		return () => {
			ro.disconnect();
			sim.stop();
			setSim(null);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "absolute inset-0 size-full touch-none cursor-crosshair",
		"aria-label": "Orbital gravity sandbox"
	});
}
function SimApp() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh min-h-dvh overflow-hidden bg-bg text-fg touch-none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimCanvas, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimApp, {});
}
//#endregion
export { Home as component };
