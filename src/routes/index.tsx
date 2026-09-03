import { createFileRoute } from "@tanstack/react-router";
import { SimApp } from "@/components/sim/sim-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <SimApp />;
}
