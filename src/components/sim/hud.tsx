import {
  Circle,
  Crosshair,
  Info,
  Pause,
  Play,
  Shield,
  Spline,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatPeriod, formatStat, type BodyStats } from "@/lib/sim/stats";
import { MASS_PRESETS, SCENARIOS, type MassPresetId, type ScenarioId } from "@/lib/sim/types";
import { getSim } from "@/lib/sim/simulation";
import { useSimStore } from "@/lib/sim/store";
import { cn } from "@/lib/utils";

const PRESET_DOT: Record<MassPresetId, string> = {
  dust: "size-1.5",
  moon: "size-2",
  planet: "size-2.5",
  giant: "size-3",
  star: "size-3.5",
};

const KIND_LABEL: Record<string, string> = {
  dust: "Dust",
  moon: "Moon",
  planet: "Planet",
  giant: "Giant",
  star: "Star",
};

const ORBIT_LABEL = {
  bound: "Bound",
  escape: "Escape",
  flyby: "Flyby",
} as const;

export function Hud() {
  const paused = useSimStore((s) => s.paused);
  const timeScale = useSimStore((s) => s.timeScale);
  const trails = useSimStore((s) => s.trails);
  const muted = useSimStore((s) => s.muted);
  const massPreset = useSimStore((s) => s.massPreset);
  const bodyCount = useSimStore((s) => s.bodyCount);
  const scenario = useSimStore((s) => s.scenario);
  const following = useSimStore((s) => s.following);
  const showHelp = useSimStore((s) => s.showHelp);
  const showPrivacy = useSimStore((s) => s.showPrivacy);
  const ready = useSimStore((s) => s.ready);
  const selected = useSimStore((s) => s.selected);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 sm:p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="pointer-events-auto max-w-[16rem] rounded-2xl border border-border bg-surface/90 p-3 sm:max-w-none">
            <p className="font-display text-2xl leading-tight tracking-[-0.03em] text-fg italic sm:text-[1.75rem]">
              Kepler
            </p>
            <p className="mt-0.5 text-xs text-muted">Orbital sandbox</p>
            <p className="mt-2 font-mono text-xs tabular-nums text-subtle">
              {ready ? `${bodyCount} ${bodyCount === 1 ? "body" : "bodies"}` : "…"}
              {following ? " · following" : ""}
            </p>
          </div>
          {selected ? (
            <div className="hidden sm:block">
              <Inspector stats={selected} following={following} />
            </div>
          ) : null}
        </div>

        <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-border bg-surface/90 p-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={paused ? "Resume" : "Pause"}
            aria-pressed={paused}
            onClick={() => getSim()?.togglePause()}
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={trails ? "Hide trails" : "Show trails"}
            aria-pressed={trails}
            onClick={() => getSim()?.setTrails(!trails)}
          >
            <Spline className={cn("size-4", !trails && "opacity-40")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={muted ? "Unmute" : "Mute"}
            aria-pressed={muted}
            onClick={() => getSim()?.setMuted(!muted)}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={following ? "Stop following" : "Follow selected body"}
            aria-pressed={following}
            onClick={() => getSim()?.toggleFollow()}
          >
            <Crosshair className={cn("size-4", !following && "opacity-40")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Privacy"
            aria-pressed={showPrivacy}
            onClick={() => getSim()?.togglePrivacy()}
          >
            <Shield className={cn("size-4", !showPrivacy && "opacity-40")} />
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-2">
        {selected ? (
          <div className="sm:hidden">
            <Inspector stats={selected} following={following} compact />
          </div>
        ) : null}
        {showHelp && !showPrivacy ? <HelpCard /> : null}
        {ready && bodyCount === 0 ? (
          <p className="pointer-events-none self-center text-center font-display text-xl italic text-fg/80">
            Drag to fling a planet
          </p>
        ) : null}

        <div className="pointer-events-auto mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-2xl border border-border bg-surface/92 p-2">
          <div className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {MASS_PRESETS.map((preset) => {
              const active = massPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => getSim()?.setMassPreset(preset.id)}
                  className={cn(
                    "flex h-11 min-w-16 shrink-0 items-center justify-center gap-2 rounded-sm px-3 text-sm font-medium transition-colors duration-[var(--motion-quick)]",
                    active ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  <span className={cn("rounded-full bg-current", PRESET_DOT[preset.id])} />
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 px-1">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="w-10 shrink-0 font-mono text-xs tabular-nums text-muted">
                {Number(timeScale.toFixed(2))}×
              </span>
              <Slider
                label="Time scale"
                value={timeScale}
                min={0.15}
                max={4}
                step={0.05}
                onValueChange={(v) => getSim()?.setTimeScale(v)}
              />
            </div>
            <Button variant="secondary" onClick={() => getSim()?.clear()}>
              Clear
            </Button>
          </div>

          <div className="flex gap-1 overflow-x-auto px-0.5 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SCENARIOS.map((item) => {
              const active = scenario === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => getSim()?.load(item.id as ScenarioId)}
                  className={cn(
                    "flex h-11 shrink-0 items-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors duration-[var(--motion-quick)]",
                    active ? "text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  <Circle className={cn("size-1.5 fill-current", active ? "text-fg" : "text-subtle")} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showPrivacy ? <PrivacySheet /> : null}
    </div>
  );
}

function Inspector({
  stats,
  following,
  compact = false,
}: {
  stats: BodyStats;
  following: boolean;
  compact?: boolean;
}) {
  const kind = KIND_LABEL[stats.kind] ?? stats.kind;
  const wrt = stats.primaryKind ? KIND_LABEL[stats.primaryKind] : null;
  const rows: Array<[string, string]> = [
    ["Mass", formatStat(stats.mass)],
    ["Radius", formatStat(stats.radius)],
    ["Heading", `${formatStat(stats.headingDeg, 0)}°`],
    ["Accel", formatStat(stats.accel)],
    ["Kinetic", formatStat(stats.kinetic)],
  ];
  if (stats.distance != null) rows.push(["Distance", formatStat(stats.distance)]);
  if (stats.relSpeed != null) rows.push(["Rel speed", formatStat(stats.relSpeed)]);
  if (stats.orbit) rows.push(["Orbit", ORBIT_LABEL[stats.orbit]]);
  if (stats.eccentricity != null) rows.push(["e", formatStat(stats.eccentricity, 2)]);
  if (stats.periapsis != null) rows.push(["Periapsis", formatStat(stats.periapsis)]);
  if (stats.apoapsis != null) rows.push(["Apoapsis", formatStat(stats.apoapsis)]);
  if (stats.period != null) rows.push(["Period", formatPeriod(stats.period)]);
  if (stats.specificEnergy != null) rows.push(["ε", formatStat(stats.specificEnergy)]);

  const visible = compact ? rows.slice(0, 8) : rows;

  return (
    <aside
      className={cn(
        "pointer-events-auto rounded-2xl border border-border bg-surface/90 p-3",
        compact ? "mx-auto w-full max-w-3xl" : "w-60 max-w-[calc(100vw-7.5rem)] max-h-[min(28rem,calc(100dvh-14rem))] overflow-y-auto",
      )}
      aria-label="Selected body statistics"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">Selected</p>
          <p className="font-display text-lg italic leading-tight text-fg">{kind}</p>
          {wrt ? <p className="text-xs text-muted">wrt {wrt}</p> : null}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          aria-label="Deselect body"
          onClick={() => getSim()?.select(null)}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="mt-3">
        <p className="font-mono text-3xl leading-none tabular-nums tracking-tight text-fg">
          {formatStat(stats.speed)}
        </p>
        <p className="mt-1 text-xs uppercase tracking-wide text-subtle">Speed</p>
      </div>

      {stats.speedHistory.length > 2 ? <Sparkline values={stats.speedHistory} /> : null}

      {stats.circularSpeed != null && stats.escapeSpeed != null && stats.relSpeed != null ? (
        <SpeedRail speed={stats.relSpeed} circular={stats.circularSpeed} escape={stats.escapeSpeed} />
      ) : null}

      <dl className={cn("mt-3 grid gap-x-3 gap-y-1", compact ? "grid-cols-2" : "grid-cols-[auto_1fr]")}>
        {visible.map(([label, value]) =>
          compact ? (
            <div key={label} className="flex min-w-0 items-baseline justify-between gap-2">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-mono text-xs tabular-nums text-fg">{value}</dd>
            </div>
          ) : (
            <div key={label} className="contents">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="text-right font-mono text-xs tabular-nums text-fg">{value}</dd>
            </div>
          ),
        )}
      </dl>
      <Button
        variant="secondary"
        className="mt-3 w-full"
        aria-pressed={following}
        onClick={() => getSim()?.toggleFollow()}
      >
        {following ? "Stop follow" : "Follow"}
      </Button>
    </aside>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(0.08, max - min);
  const w = 220;
  const h = 28;
  const d = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * w;
      const y = h - 3 - ((v - min) / span) * (h - 6);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-7 w-full text-fg" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.75" />
    </svg>
  );
}

function SpeedRail({ speed, circular, escape }: { speed: number; circular: number; escape: number }) {
  const max = Math.max(escape * 1.2, speed, circular) || 1;
  const pct = (v: number) => `${Math.max(0, Math.min(100, (v / max) * 100))}%`;
  return (
    <div className="mt-3">
      <div className="relative h-1.5 rounded-full bg-surface-2">
        <div className="absolute inset-y-0 left-0 rounded-full bg-accent/80" style={{ width: pct(speed) }} />
        <span
          className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted"
          style={{ left: pct(circular) }}
        />
        <span
          className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg"
          style={{ left: pct(escape) }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-xs tabular-nums text-subtle">
        <span>circ {formatStat(circular)}</span>
        <span>esc {formatStat(escape)}</span>
      </div>
    </div>
  );
}

function HelpCard() {
  return (
    <div className="pointer-events-auto mx-auto w-full max-w-3xl rounded-2xl border border-border bg-surface/90 p-3">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 size-4 shrink-0 text-subtle" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-fg text-pretty">
            Drag to fling a planet. Tap a body for speed and orbit stats. Scroll to zoom, right-drag or two fingers to
            pan.
          </p>
          <p className="mt-1 hidden text-xs text-muted sm:block">
            Space pauses · C clears · F follow · Esc deselect · 1–5 mass
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          aria-label="Dismiss help"
          onClick={() => getSim()?.dismissHelp()}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function PrivacySheet() {
  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close privacy"
        className="absolute inset-0 bg-bg/70"
        onClick={() => getSim()?.setPrivacy(false)}
      />
      <div
        role="dialog"
        aria-labelledby="privacy-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p id="privacy-title" className="font-display text-2xl italic leading-tight text-fg">
              Stays on this device
            </p>
            <p className="mt-1 text-sm text-muted text-pretty">
              Kepler never reads your files, photos, camera, microphone, or location. Publishing the app publishes this
              game, not your computer.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            aria-label="Close privacy"
            onClick={() => getSim()?.setPrivacy(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-fg">
          <li className="flex justify-between gap-4 border-b border-border pb-2">
            <span className="text-muted">Physics & stats</span>
            <span>This tab only</span>
          </li>
          <li className="flex justify-between gap-4 border-b border-border pb-2">
            <span className="text-muted">UI prefs</span>
            <span>Optional, local</span>
          </li>
          <li className="flex justify-between gap-4 border-b border-border pb-2">
            <span className="text-muted">Accounts / database</span>
            <span>None</span>
          </li>
          <li className="flex justify-between gap-4">
            <span className="text-muted">Trackers / fonts CDN</span>
            <span>None</span>
          </li>
        </ul>
        <p className="mt-4 text-xs text-subtle text-pretty">
          A public link contains the Kepler source and share-card art. It does not contain anything from your hard drive
          except those app files. Play sessions never leave the browser that ran them.
        </p>
        <Button variant="secondary" className="mt-4 w-full" onClick={() => getSim()?.forgetDevice()}>
          Forget this device
        </Button>
      </div>
    </div>
  );
}
