export type AmbientSoundType = 'rain' | 'white-noise' | 'lo-fi' | 'off';

class AmbientNoiseEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private currentSound: AmbientSoundType = 'off';
  private volume: number = 0.35;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSound(sound: AmbientSoundType) {
    if (sound === this.currentSound) return;
    this.stop();

    if (sound === 'off') {
      this.currentSound = 'off';
      return;
    }

    this.initContext();
    if (!this.ctx) return;

    this.currentSound = sound;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (sound === 'white-noise') {
      this.startWhiteNoise();
    } else if (sound === 'rain') {
      this.startRainNoise();
    } else if (sound === 'lo-fi') {
      this.startLofiDrone();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getSound(): AmbientSoundType {
    return this.currentSound;
  }

  public getVolume(): number {
    return this.volume;
  }

  public stop() {
    try {
      if (this.currentSource) {
        (this.currentSource as any).stop?.();
        this.currentSource.disconnect();
        this.currentSource = null;
      }
    } catch (e) {
      // Ignored
    }
    this.currentSound = 'off';
  }

  private startWhiteNoise() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to soften white noise into pleasant background static
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start();
    this.currentSource = whiteNoise;
  }

  private startRainNoise() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    rainSource.connect(filter);
    filter.connect(this.gainNode);
    rainSource.start();
    this.currentSource = rainSource;
  }

  private startLofiDrone() {
    if (!this.ctx || !this.gainNode) return;
    // Harmonious chord drone (root + fifth + octaves)
    const baseFreq = 110; // A2
    const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2, baseFreq * 2.5];
    const oscGroup = this.ctx.createGain();

    freqs.forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f + (Math.random() - 0.5) * 2, this.ctx!.currentTime);
      osc.connect(oscGroup);
      osc.start();
    });

    const lofiFilter = this.ctx.createBiquadFilter();
    lofiFilter.type = 'lowpass';
    lofiFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

    oscGroup.connect(lofiFilter);
    lofiFilter.connect(this.gainNode);
    this.currentSource = oscGroup;
  }
}

export const ambientEngine = new AmbientNoiseEngine();
