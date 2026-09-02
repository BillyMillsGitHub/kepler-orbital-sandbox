import { Hud } from "./hud";
import { SimCanvas } from "./sim-canvas";

export function SimApp() {
  return (
    <main className="relative h-dvh min-h-dvh overflow-hidden bg-bg text-fg touch-none">
      <SimCanvas />
      <Hud />
    </main>
  );
}
