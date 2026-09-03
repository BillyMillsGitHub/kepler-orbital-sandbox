import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg text-fg">
      <p className="font-display text-2xl italic">Kepler</p>
    </main>
  );
}
