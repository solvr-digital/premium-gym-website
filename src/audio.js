// IRONVAULT Web Audio API Ambient Sound System & UI Haptics
// 100% self-contained synthesized luxury cinematic soundscape

class IronVaultAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneSub = null;
    this.noiseNode = null;
    this.droneGain = null;
    this.masterGain = null;
    this.filter = null;
    this.isMuted = true;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  toggleSound() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stopDrone();
      this.isPlaying = false;
      return false;
    } else {
      this.startDrone();
      this.isPlaying = true;
      this.playChime(180, 0.4, 'sine');
      return true;
    }
  }

  startDrone() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Filter for low warm cinematic hum
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(140, now);
    this.filter.Q.setValueAtTime(3, now);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.001, now);
    this.droneGain.gain.exponentialRampToValueAtTime(0.28, now + 3);

    // Osc 1: Deep C drone (55Hz / A1 or 65.4Hz / C2)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(55, now);

    // Osc 2: Detuned drone (55.4Hz) for rich analog chorusing
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(55.6, now);

    // Sub Bass: Deep 27.5Hz felt more than heard
    this.droneSub = this.ctx.createOscillator();
    this.droneSub.type = 'sine';
    this.droneSub.frequency.setValueAtTime(27.5, now);

    // Modulator LFO for breathing movement
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, now); // slow breathing cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(30, now);
    lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    lfo.start(now);

    this.droneOsc1.connect(this.filter);
    this.droneOsc2.connect(this.filter);
    this.droneSub.connect(this.filter);
    this.filter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1.start(now);
    this.droneOsc2.start(now);
    this.droneSub.start(now);
  }

  stopDrone() {
    if (!this.ctx || !this.droneGain) return;
    const now = this.ctx.currentTime;
    this.droneGain.gain.cancelScheduledValues(now);
    this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
    this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 1);

    setTimeout(() => {
      try {
        if (this.droneOsc1) { this.droneOsc1.stop(); this.droneOsc1.disconnect(); }
        if (this.droneOsc2) { this.droneOsc2.stop(); this.droneOsc2.disconnect(); }
        if (this.droneSub) { this.droneSub.stop(); this.droneSub.disconnect(); }
      } catch (e) {}
    }, 1100);
  }

  // Luxury UI click / haptic acoustic feedback
  playClick(pitch = 800) {
    if (!this.isPlaying || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + 0.04);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch(e) {}
  }

  // Cinematic swell when preloader unlocks
  playImpact() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(45, now + 1.2);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 1.2);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.6);
    } catch(e) {}
  }

  playChime(freq = 440, duration = 0.5, type = 'sine') {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch(e) {}
  }
}

export const soundManager = new IronVaultAudio();
