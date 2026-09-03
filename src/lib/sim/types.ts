export type BodyKind = "dust" | "moon" | "planet" | "giant" | "star";

export type MassPresetId = BodyKind;

export type ScenarioId = "helios" | "binary" | "figure8" | "empty";

export type Rgb = readonly [number, number, number];

export type Body = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  ix: number;
  iy: number;
  mass: number;
  radius: number;
  kind: BodyKind;
  color: Rgb;
  trailX: Float32Array;
  trailY: Float32Array;
  trailHead: number;
  trailCount: number;
  held: boolean;
  pop: number;
};

export type BodySeed = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  kind: BodyKind;
  color?: Rgb;
  radius?: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: Rgb;
};

export type FlingState = {
  pointerId: number;
  startX: number;
  startY: number;
  curX: number;
  curY: number;
  bodyId: number | null;
  screenX: number;
  screenY: number;
};

export type PanState = {
  pointerId: number;
  lastX: number;
  lastY: number;
};

export type PinchState = {
  a: number;
  b: number;
  lastDist: number;
  lastMidX: number;
  lastMidY: number;
};

export const G = 280;

export const FIXED_DT = 1 / 120;

export const MAX_BODIES = 48;

export const TRAIL_LEN = 720;

export const MASS_PRESETS: readonly {
  id: MassPresetId;
  label: string;
  mass: number;
  kind: BodyKind;
}[] = [
  { id: "dust", label: "Dust", mass: 2.2, kind: "dust" },
  { id: "moon", label: "Moon", mass: 11, kind: "moon" },
  { id: "planet", label: "Planet", mass: 46, kind: "planet" },
  { id: "giant", label: "Giant", mass: 240, kind: "giant" },
  { id: "star", label: "Star", mass: 6400, kind: "star" },
];

export const KIND_COLOR: Record<BodyKind, Rgb> = {
  dust: [132, 128, 122],
  moon: [196, 192, 184],
  planet: [118, 142, 144],
  giant: [148, 138, 128],
  star: [236, 230, 218],
};

export const KIND_DENSITY: Record<BodyKind, number> = {
  dust: 3.4,
  moon: 3.9,
  planet: 4.05,
  giant: 4.55,
  star: 2.55,
};

export const SCENARIOS: readonly { id: ScenarioId; label: string }[] = [
  { id: "helios", label: "Helios" },
  { id: "binary", label: "Binary" },
  { id: "figure8", label: "Figure 8" },
  { id: "empty", label: "Empty" },
];
