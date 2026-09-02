import {
  Circle,
  Crosshair,
  Info,
  Pause,
  Play,
  Spline,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  const ready = useSimStore((s) => s.ready);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 sm:p-4">
      <header className="flex items-start justify-between gap-3">
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
            aria-label={following ? "Stop following" : "Follow is off — tap a body"}
            aria-pressed={following}
            onClick={() => {
              const sim = getSim();
              if (!sim || sim.followId == null) return;
              sim.followId = null;
              useSimStore.getState().patch({ following: false });
            }}
          >
            <Crosshair className={cn("size-4", !following && "opacity-40")} />
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-2">
        {showHelp ? <HelpCard /> : null}
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
            Drag to fling a planet. Drag an existing body to throw it. Scroll to zoom, right-drag or two fingers to pan.
            Tap a body to follow.
          </p>
          <p className="mt-1 hidden text-xs text-muted sm:block">
            Space pauses · C clears · 1–5 mass · T trails
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
