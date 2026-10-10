// One audio graph, short look-ahead scheduling, and no downloaded audio files.
export class GardenAudio {
  private ctx: AudioContext | null = null;
  private effects: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private next = 0;
  private beat = 0;
  private sound = true;
  private music = false;
  private volume = .65;

  unlock() {
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
        const compressor = this.ctx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.ratio.value = 4;
        compressor.connect(this.ctx.destination);
        this.effects = this.ctx.createGain();
        this.musicBus = this.ctx.createGain();
        this.effects.connect(compressor);
        this.musicBus.connect(compressor);
      }
      this.configure(this.sound, this.music, this.volume);
      void this.ctx.resume().catch(() => {});
    } catch { /* Audio is optional; play remains available. */ }
  }

  configure(sound: boolean, music: boolean, volume: number) {
    this.sound = sound; this.music = music; this.volume = volume;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.effects?.gain.setTargetAtTime(sound ? volume * .5 : 0, now, .04);
    this.musicBus?.gain.setTargetAtTime(music ? volume * .24 : 0, now, .15);
    if (music && !this.timer && !document.hidden) {
      this.next = now + .1;
      this.timer = setInterval(() => this.schedule(), 100);
    } else if (!music && this.timer) {
      clearInterval(this.timer); this.timer = null;
    }
  }

  private note(midi: number, time: number, length: number, level: number, bus: GainNode, warm = false) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = warm ? 'triangle' : 'sine';
    osc.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(level, time + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, time + length);
    osc.connect(gain); gain.connect(bus);
    osc.start(time); osc.stop(time + length + .02);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  private schedule() {
    if (!this.ctx || !this.musicBus || document.hidden || this.ctx.state !== 'running') return;
    if (this.next < this.ctx.currentTime) this.next = this.ctx.currentTime + .05;
    const chords = [[48,55,60,64],[45,52,57,60],[41,48,53,57],[43,50,55,59]];
    const melody = [72,0,76,79,0,76,74,0,72,0,69,72,76,0,72,0,69,0,72,77,0,76,72,0,71,0,74,79,0,74,71,0];
    while (this.next < this.ctx.currentTime + .25) {
      const chord = chords[Math.floor(this.beat / 8) % 4];
      this.note(chord[[0,2,1,3][this.beat % 4]], this.next, 1.1, .14, this.musicBus, true);
      const top = melody[this.beat % melody.length];
      if (top) this.note(top, this.next + .025, 1.3, .22, this.musicBus);
      this.beat++; this.next += .43;
    }
  }

  play(kind: 'tap' | 'roll' | 'step' | 'ladder' | 'snake' | 'win' | 'miss', step = 0) {
    if (!this.sound || !this.ctx || !this.effects || document.hidden) return;
    const notes = kind === 'win' ? [60,64,67,72,76,79,84] : kind === 'ladder' ? [60,64,67,72] : kind === 'snake' ? [72,69,65,60] : kind === 'roll' ? [48,55,51,58,53] : kind === 'miss' ? [60,55] : [kind === 'step' ? [60,62,64,67,69,72][step % 6] : 72];
    const spacing = kind === 'roll' ? .055 : .105;
    notes.forEach((note,i) => this.note(note, this.ctx!.currentTime + i * spacing, kind === 'win' ? .85 : .22, kind === 'step' ? .22 : .32, this.effects!, kind === 'roll'));
  }

  visibility() {
    if (!this.ctx) return;
    if (document.hidden) {
      if(this.timer)clearInterval(this.timer);
      this.timer=null;
      void this.ctx.suspend().catch(() => {});
    } else { this.next = this.ctx.currentTime + .1; this.configure(this.sound,this.music,this.volume); void this.ctx.resume().catch(() => {}); }
  }

  close() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    void this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}

