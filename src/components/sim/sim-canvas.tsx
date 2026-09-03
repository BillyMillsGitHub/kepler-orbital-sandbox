import { useEffect, useRef } from "react";
import { Simulation, setSim } from "@/lib/sim/simulation";

export function SimCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const sim = new Simulation(canvas);
    setSim(sim);

    const fit = () => {
      const parent = canvas.parentElement ?? canvas;
      const rect = parent.getBoundingClientRect();
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

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 size-full cursor-crosshair touch-none"
      aria-label="Orbital gravity sandbox"
    />
  );
}
