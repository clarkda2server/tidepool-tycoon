/**
 * requestAnimationFrame loop with an fps cap, paused automatically while the page is hidden.
 * Rendering is fully separate from the 10 Hz logic tick.
 */
export class RenderLoop {
  private raf = 0;
  private last = 0;
  private running = false;
  fps: number;

  constructor(
    private draw: (timeMs: number, dtMs: number) => void,
    fps = 30,
  ) {
    this.fps = fps;
    document.addEventListener('visibilitychange', this.onVis);
  }

  private onVis = () => {
    if (document.visibilityState === 'hidden') cancelAnimationFrame(this.raf);
    else if (this.running) this.schedule();
  };

  private schedule() {
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (t: number) => {
    const minDt = 1000 / this.fps;
    const dt = t - this.last;
    if (dt >= minDt - 2) {
      this.last = t;
      this.draw(t, Math.min(dt, 250));
    }
    this.schedule();
  };

  start() {
    if (this.running) return;
    this.running = true;
    this.schedule();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    document.removeEventListener('visibilitychange', this.onVis);
  }
}
