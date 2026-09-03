type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export class SimAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  muted = false;

  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as AudioWindow).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC({ latencyHint: "interactive" });
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.22;
    this.master.connect(this.ctx.destination);
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const target = muted ? 0 : 0.22;
    master.gain.setTargetAtTime(target, ctx.currentTime, 0.03);
  }

  private noise(duration: number): AudioBuffer | null {
    const ctx = this.ctx;
    if (!ctx) return null;
    const n = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  fling(speed: number): void {
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
    osc.frequency.exponentialRampToValueAtTime(Math.max(80, f * 0.45), t + 0.18);
    filter.type = "lowpass";
    filter.frequency.value = 1400;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.24);
    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  merge(intensity: number): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || this.muted) return;
    const t = ctx.currentTime;
    const mag = Math.min(1, intensity);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(70 + mag * 40, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.28);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22 * mag, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.34);

    const buf = this.noise(0.16);
    if (buf) {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const ng = ctx.createGain();
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 420;
      bp.Q.value = 0.7;
      ng.gain.setValueAtTime(0.12 * mag, t);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      src.connect(bp);
      bp.connect(ng);
      ng.connect(master);
      src.start(t);
      src.stop(t + 0.16);
    }

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
}
