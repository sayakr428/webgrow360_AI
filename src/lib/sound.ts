// Every sound on the site is synthesised with the Web Audio API: no files to download.
// Nothing plays until the visitor switches sound on (a user gesture), as browsers require.

type Voice = { stop: () => void };

const PENTATONIC = [0, 3, 5, 7, 10, 12, 15];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private fx: GainNode | null = null;
  private ambient: Voice | null = null;
  private lastHover = 0;
  enabled = false;

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    this.master.connect(comp).connect(this.ctx.destination);
    this.fx = this.ctx.createGain();
    this.fx.gain.value = 1;
    this.fx.connect(this.master);
    return this.ctx;
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    const ctx = this.ensure();
    if (!ctx) return;
    if (on && ctx.state === "suspended") ctx.resume();
    if (!on) this.stopAmbient();
  }

  private tone(freq: number, opts: { type?: OscillatorType; dur?: number; gain?: number; to?: number; delay?: number; attack?: number } = {}) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx || !this.fx) return;
    const { type = "sine", dur = 0.12, gain = 0.06, to, delay = 0, attack = 0.004 } = opts;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.fx);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noise(dur: number, gain: number, freq: number, q = 1, delay = 0) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx || !this.fx) return;
    const t = ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(freq, t);
    bp.frequency.exponentialRampToValueAtTime(freq * 2.4, t + dur);
    bp.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(g).connect(this.fx);
    src.start(t);
  }

  hover() {
    const now = performance.now();
    if (now - this.lastHover < 45) return;
    this.lastHover = now;
    this.tone(2200, { to: 2900, dur: 0.05, gain: 0.018, type: "sine" });
  }

  click() {
    this.tone(520, { to: 260, dur: 0.11, gain: 0.07, type: "triangle" });
    this.noise(0.04, 0.03, 3200, 2);
  }

  toggle(on: boolean) {
    const base = on ? 440 : 660;
    this.tone(base, { dur: 0.14, gain: 0.05, type: "triangle" });
    this.tone(on ? base * 1.5 : base / 1.5, { dur: 0.2, gain: 0.05, type: "triangle", delay: 0.07 });
  }

  open() {
    this.tone(392, { dur: 0.3, gain: 0.045, type: "sine" });
    this.tone(587, { dur: 0.36, gain: 0.03, type: "sine", delay: 0.05 });
  }

  close() {
    this.tone(587, { to: 392, dur: 0.18, gain: 0.035, type: "sine" });
  }

  // Pitch follows the value, so a slider "plays" as it moves.
  step(ratio: number) {
    const idx = Math.round(Math.max(0, Math.min(1, ratio)) * (PENTATONIC.length * 2 - 1));
    const semis = PENTATONIC[idx % PENTATONIC.length] + 12 * Math.floor(idx / PENTATONIC.length);
    this.tone(330 * Math.pow(2, semis / 12), { dur: 0.09, gain: 0.04, type: "sine" });
  }

  whoosh() {
    this.noise(0.5, 0.05, 380, 0.8);
  }

  select() {
    this.tone(880, { dur: 0.08, gain: 0.04, type: "square", to: 1320 });
  }

  // The ambient bed: a soft choir drone with sparse pentatonic chimes, faded in over 1.5 s.
  startAmbient() {
    if (!this.enabled || this.ambient) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, ctx.currentTime);
    out.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 1.5);
    out.connect(this.master);

    // A soft choir: detuned voices on a D minor-ish chord, each through two vowel formants ("ah"), with slow vibrato.
    const formants = [700, 1150].map((f) => {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = f;
      bp.Q.value = 5;
      bp.connect(out);
      return bp;
    });
    const body = ctx.createBiquadFilter();
    body.type = "lowpass";
    body.frequency.value = 1800;
    body.connect(out);
    const vib = ctx.createOscillator();
    const vibGain = ctx.createGain();
    vib.frequency.value = 4.6;
    vibGain.gain.value = 1.6;
    vib.connect(vibGain);
    vib.start();
    const notes = [146.8, 220, 174.6, 293.7, 349.2];
    const oscs = notes.flatMap((f, i) =>
      [-4, 4].map((cents) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = f;
        o.detune.value = cents + (i % 2 ? 2 : -2);
        vibGain.connect(o.frequency);
        const g = ctx.createGain();
        g.gain.value = 0.018;
        o.connect(g);
        formants.forEach((bp) => g.connect(bp));
        g.connect(body);
        o.start();
        return o;
      })
    );
    const lfo = vib;
    const chime = () => {
      if (!this.enabled) return;
      const semis = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
      const f = 440 * Math.pow(2, semis / 12) * (Math.random() < 0.3 ? 2 : 1);
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.035, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 2.7);
    };
    const chimeTimer = window.setInterval(() => Math.random() < 0.35 && chime(), 2600);

    this.ambient = {
      stop: () => {
        window.clearInterval(chimeTimer);
        const t = ctx.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(out.gain.value, t);
        out.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
        window.setTimeout(() => {
          oscs.forEach((o) => o.stop());
          lfo.stop();
          out.disconnect();
        }, 1300);
      },
    };
  }

  // The moment the two fingertips meet: a low boom, a bright ping and a short burst of air.
  impact() {
    if (!this.enabled) return;
    this.tone(90, { to: 38, dur: 0.6, gain: 0.22, type: "sine" });
    this.tone(1760, { dur: 0.9, gain: 0.05, type: "sine", delay: 0.02 });
    this.tone(2637, { dur: 1.2, gain: 0.03, type: "sine", delay: 0.06 });
    this.noise(0.35, 0.09, 600, 0.7);
  }

  // A hum that rises as the gap between the hands closes; level 0 silences it.
  private humVoice: { osc: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null = null;
  hum(level: number) {
    if (!this.enabled) level = 0;
    const ctx = this.ctx;
    if (!ctx || !this.fx) return;
    if (!this.humVoice && level > 0.01) {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 700;
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 110;
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = 220.6;
      osc.connect(lp);
      osc2.connect(lp);
      lp.connect(gain).connect(this.fx);
      osc.start();
      osc2.start();
      this.humVoice = { osc, osc2, gain };
    }
    if (!this.humVoice) return;
    const t = ctx.currentTime;
    this.humVoice.gain.gain.setTargetAtTime(Math.min(1, level) * 0.05, t, 0.08);
    this.humVoice.osc.frequency.setTargetAtTime(110 + level * 55, t, 0.1);
    this.humVoice.osc2.frequency.setTargetAtTime(220.6 + level * 110, t, 0.1);
  }

  stopAmbient() {
    this.ambient?.stop();
    this.ambient = null;
  }
}

// The constructor touches no browser API, so this is safe to import on the server.
export const sound = new SoundEngine();
