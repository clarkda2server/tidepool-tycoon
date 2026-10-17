import type { AudioUnlock } from './types';

export class WebAudioUnlock implements AudioUnlock {
  private ctx: AudioContext | null = null;
  private installed = false;

  getContext() {
    return this.ctx;
  }

  install() {
    if (this.installed) return;
    this.installed = true;
    const unlock = () => {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx ??= new Ctor();
      // Play one silent sample: required by older iOS to fully unlock output.
      const buf = this.ctx.createBuffer(1, 1, 22050);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.ctx.destination);
      src.start(0);
      void this.ctx.resume();
      if (this.ctx.state === 'running') {
        window.removeEventListener('pointerdown', unlock, true);
        window.removeEventListener('touchend', unlock, true);
      }
    };
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('touchend', unlock, true);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.ctx && this.ctx.state !== 'running') void this.ctx.resume();
    });
  }
}
