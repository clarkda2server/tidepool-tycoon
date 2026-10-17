/**
 * The Dock: calm night water, a wooden dock, moon glow, and a bobbing float.
 * Everything is drawn procedurally. Static layers are cached to an offscreen canvas.
 */
interface Ripple { x: number; y: number; t: number }

export class DockScene {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private bg: HTMLCanvasElement | null = null;
  private ripples: Ripple[] = [];
  private castT = -1; // ms since last cast, for the float dip
  reduceMotion = false;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('2D canvas unavailable');
    this.ctx = ctx;
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    // Cap DPR at 2: iPhones are 3x but 2x is visually identical here and ~2x cheaper.
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, r.width);
    this.h = Math.max(1, r.height);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.bg = null;
  }

  private get waterY() {
    return this.h * 0.34;
  }

  private get floatPos() {
    return { x: this.w * 0.62, y: this.waterY + (this.h - this.waterY) * 0.42 };
  }

  onCast() {
    this.castT = 0;
    const { x, y } = this.floatPos;
    this.ripples.push({ x, y, t: 0 });
    if (this.ripples.length > 6) this.ripples.shift();
  }

  private buildBackground() {
    const c = document.createElement('canvas');
    c.width = this.canvas.width;
    c.height = this.canvas.height;
    const g = c.getContext('2d')!;
    g.scale(this.dpr, this.dpr);
    const { w, h } = this;
    const wy = this.waterY;

    // Sky
    const sky = g.createLinearGradient(0, 0, 0, wy);
    sky.addColorStop(0, '#040812');
    sky.addColorStop(1, '#0d1d3a');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, wy);

    // Stars (deterministic)
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(220,230,255,${0.15 + rnd() * 0.35})`;
      g.beginPath();
      g.arc(rnd() * w, rnd() * wy * 0.85, 0.5 + rnd() * 1.1, 0, Math.PI * 2);
      g.fill();
    }

    // Moon
    const mx = w * 0.22, my = wy * 0.38;
    const glow = g.createRadialGradient(mx, my, 4, mx, my, 70);
    glow.addColorStop(0, 'rgba(230,236,255,0.35)');
    glow.addColorStop(1, 'rgba(230,236,255,0)');
    g.fillStyle = glow;
    g.fillRect(mx - 70, my - 70, 140, 140);
    g.fillStyle = '#dfe6f7';
    g.beginPath();
    g.arc(mx, my, 16, 0, Math.PI * 2);
    g.fill();

    // Far shore silhouette
    g.fillStyle = '#071226';
    g.beginPath();
    g.moveTo(0, wy);
    for (let x = 0; x <= w; x += 8) g.lineTo(x, wy - 10 - Math.sin(x * 0.02) * 6 - Math.sin(x * 0.007) * 10);
    g.lineTo(w, wy);
    g.fill();

    // Water
    const water = g.createLinearGradient(0, wy, 0, h);
    water.addColorStop(0, '#11294d');
    water.addColorStop(0.5, '#0a1a33');
    water.addColorStop(1, '#050b16');
    g.fillStyle = water;
    g.fillRect(0, wy, w, h - wy);

    // Dock (bottom-left), planks
    const dx = -10, dy = h * 0.72, dw = w * 0.5, dh = 26;
    g.fillStyle = '#2a1f1a';
    for (let i = 0; i < 4; i++) g.fillRect(dx + 20 + i * (dw / 4), dy + dh - 4, 10, h - dy);
    const plank = g.createLinearGradient(0, dy, 0, dy + dh);
    plank.addColorStop(0, '#6b4f3a');
    plank.addColorStop(1, '#3f2d22');
    g.fillStyle = plank;
    g.fillRect(dx, dy, dw, dh);
    g.strokeStyle = 'rgba(0,0,0,0.3)';
    g.lineWidth = 1;
    for (let x = dx + 28; x < dx + dw; x += 28) {
      g.beginPath();
      g.moveTo(x, dy);
      g.lineTo(x, dy + dh);
      g.stroke();
    }
    // Lantern
    const lx = dx + dw - 18, ly = dy - 30;
    const lg = g.createRadialGradient(lx, ly, 2, lx, ly, 60);
    lg.addColorStop(0, 'rgba(255,200,120,0.35)');
    lg.addColorStop(1, 'rgba(255,200,120,0)');
    g.fillStyle = lg;
    g.fillRect(lx - 60, ly - 60, 120, 120);
    g.fillStyle = '#3f2d22';
    g.fillRect(lx - 1.5, ly, 3, 30);
    g.fillStyle = '#ffd59a';
    g.fillRect(lx - 5, ly - 8, 10, 10);

    this.bg = c;
  }

  draw(t: number, dt: number) {
    if (!this.bg) this.buildBackground();
    const { ctx, w, h } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.bg!, 0, 0);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const wy = this.waterY;
    const motion = this.reduceMotion ? 0.25 : 1;

    // Moon reflection shimmer
    const mx = w * 0.22;
    for (let i = 0; i < 9; i++) {
      const y = wy + 10 + i * 12;
      const wob = Math.sin(t * 0.0012 * motion + i) * 6 * motion;
      ctx.fillStyle = `rgba(220,230,255,${0.12 - i * 0.011})`;
      ctx.fillRect(mx - 18 + wob + i, y, 36 - i * 2, 2);
    }

    // Gentle wave lines
    ctx.strokeStyle = 'rgba(120,180,255,0.08)';
    ctx.lineWidth = 1.5;
    for (let row = 0; row < 7; row++) {
      const y0 = wy + 30 + row * ((h - wy) / 7);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 10) {
        const y = y0 + Math.sin(x * 0.03 + t * 0.0008 * motion + row) * 3;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Ripples
    for (const r of this.ripples) r.t += dt;
    this.ripples = this.ripples.filter((r) => r.t < 1400);
    for (const r of this.ripples) {
      const p = r.t / 1400;
      ctx.strokeStyle = `rgba(160,210,255,${0.45 * (1 - p)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y + 4, 8 + p * 60, 3 + p * 18, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Line from top of screen (rod tip off-screen) to float
    const { x: fx, y: fy0 } = this.floatPos;
    if (this.castT >= 0) this.castT += dt;
    const dip = this.castT >= 0 && this.castT < 600 ? Math.sin((this.castT / 600) * Math.PI) * 10 : 0;
    const bob = Math.sin(t * 0.002 * motion) * 3 * motion;
    const fy = fy0 + bob + dip;
    ctx.strokeStyle = 'rgba(220,230,255,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.36, h * 0.72 - 120);
    ctx.quadraticCurveTo(fx - 30, fy - 120, fx, fy - 10);
    ctx.stroke();

    // Float
    ctx.fillStyle = '#ff7a8a';
    ctx.beginPath();
    ctx.arc(fx, fy - 4, 7, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#f2f5ff';
    ctx.beginPath();
    ctx.arc(fx, fy - 4, 7, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = 'rgba(160,210,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(fx, fy + 4, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
