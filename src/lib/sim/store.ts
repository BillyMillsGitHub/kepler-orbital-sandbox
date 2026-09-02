import { create } from "zustand";
import type { MassPresetId, ScenarioId } from "./types";

export type SimHud = {
  ready: boolean;
  paused: boolean;
  timeScale: number;
  trails: boolean;
  muted: boolean;
  massPreset: MassPresetId;
  bodyCount: number;
  scenario: ScenarioId;
  following: boolean;
  showHelp: boolean;
};

type SimHudApi = SimHud & {
  patch: (partial: Partial<SimHud>) => void;
};

export const useSimStore = create<SimHudApi>((set) => ({
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
  patch: (partial) => set(partial),
}));
