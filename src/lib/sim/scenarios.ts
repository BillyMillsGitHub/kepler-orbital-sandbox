import { createBody, orbitVelocity, radiusFromMass } from "./physics";
import { G, type Body, type BodySeed } from "./types";

function seedToBodies(seeds: BodySeed[]): Body[] {
  return seeds.map((s) => createBody(s));
}

function around(
  parent: BodySeed,
  distance: number,
  angle: number,
  mass: number,
  kind: BodySeed["kind"],
  color?: BodySeed["color"],
): BodySeed {
  const x = parent.x + Math.cos(angle) * distance;
  const y = parent.y + Math.sin(angle) * distance;
  const v = orbitVelocity(parent, x, y);
  return { x, y, vx: v.vx, vy: v.vy, mass, kind, color };
}

export function scenarioHelios(): Body[] {
  const star: BodySeed = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    mass: 7200,
    kind: "star",
    color: [238, 232, 220],
  };
  const inner = around(star, 260, -0.4, 16, "moon", [186, 168, 150]);
  const ocean = around(star, 420, 1.15, 110, "planet", [112, 140, 146]);
  const moonDist =
    radiusFromMass(ocean.mass, "planet") + radiusFromMass(6, "moon") + 12;
  const moon = around(ocean, moonDist, 0.55, 6, "moon", [200, 196, 188]);
  const giant = around(star, 660, 2.5, 280, "giant", [150, 136, 122]);
  const ice = around(star, 880, 4.1, 28, "planet", [154, 170, 182]);
  const comet = around(star, 1180, -1.15, 3.2, "dust", [176, 178, 184]);
  comet.vx *= 0.88;
  comet.vy *= 0.88;
  return seedToBodies([star, inner, ocean, moon, giant, ice, comet]);
}

export function scenarioBinary(): Body[] {
  const d = 118;
  const m = 3100;
  const v = 0.5 * Math.sqrt((G * (m + m)) / (d * 2));
  const a: BodySeed = {
    x: -d,
    y: 0,
    vx: 0,
    vy: v,
    mass: m,
    kind: "star",
    color: [236, 228, 214],
  };
  const b: BodySeed = {
    x: d,
    y: 0,
    vx: 0,
    vy: -v,
    mass: m,
    kind: "star",
    color: [210, 216, 224],
  };
  const com: BodySeed = { x: 0, y: 0, vx: 0, vy: 0, mass: m * 2, kind: "star" };
  const planet = around(com, 420, 0.9, 52, "planet", [120, 138, 148]);
  const inner = around(com, 250, 3.4, 18, "moon", [176, 160, 148]);
  return seedToBodies([a, b, planet, inner]);
}

export function scenarioFigure8(): Body[] {
  const S = 70;
  const mass = 200;
  const radius = 7.2;
  const vScale = Math.sqrt((G * mass) / S);
  const p1x = 0.970004356697046 * S;
  const p1y = -0.243087532909274 * S;
  const v1x = 0.466203685 * vScale;
  const v1y = 0.43236573 * vScale;
  const color: [number, number, number][] = [
    [168, 176, 184],
    [196, 186, 172],
    [148, 160, 166],
  ];
  const seeds: BodySeed[] = [
    { x: p1x, y: p1y, vx: v1x, vy: v1y, mass, kind: "moon", color: color[0], radius },
    { x: -p1x, y: -p1y, vx: v1x, vy: v1y, mass, kind: "moon", color: color[1], radius },
    { x: 0, y: 0, vx: -2 * v1x, vy: -2 * v1y, mass, kind: "moon", color: color[2], radius },
  ];
  return seedToBodies(seeds);
}

export function loadScenario(id: string): Body[] {
  switch (id) {
    case "binary":
      return scenarioBinary();
    case "figure8":
      return scenarioFigure8();
    case "empty":
      return [];
    default:
      return scenarioHelios();
  }
}

export function fitCamera(bodies: Body[]): { x: number; y: number; zoom: number } {
  if (bodies.length === 0) return { x: 0, y: 0, zoom: 0.85 };
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
  const zoom = Math.min(1.35, Math.max(0.28, 0.72 / (Math.max(w, h) / 780)));
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2, zoom };
}
