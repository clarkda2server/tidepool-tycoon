import type { WakeLock } from './types';

// A tiny silent, looping video keeps iOS < 16.4 awake when the Wake Lock API is missing.
// Generated at runtime from a 1x1 canvas stream so we ship no media files.
function makeFallbackVideo(): HTMLVideoElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 2;
  const ctx = canvas.getContext('2d');
  if (!ctx || !('captureStream' in canvas)) return null;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 2, 2);
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-10px;top:-10px;';
  video.srcObject = (canvas as HTMLCanvasElement & { captureStream(fps?: number): MediaStream }).captureStream(1);
  return video;
}

export class WebWakeLock implements WakeLock {
  private sentinel: WakeLockSentinel | null = null;
  private video: HTMLVideoElement | null = null;
  private wanted = false;
  readonly supported: WakeLock['supported'];

  constructor() {
    this.supported =
      'wakeLock' in navigator ? 'native' : typeof HTMLCanvasElement !== 'undefined' && 'captureStream' in HTMLCanvasElement.prototype ? 'fallback' : 'none';
    // The OS drops wake locks when we're hidden; re-acquire on return.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.wanted) void this.acquire();
    });
  }

  get active() {
    return this.wanted && (this.sentinel !== null || (this.video !== null && !this.video.paused));
  }

  private async acquire() {
    if (this.supported === 'native') {
      try {
        this.sentinel = await navigator.wakeLock.request('screen');
        this.sentinel.addEventListener('release', () => (this.sentinel = null));
      } catch {
        this.sentinel = null;
      }
    } else if (this.supported === 'fallback') {
      this.video ??= makeFallbackVideo();
      if (this.video) {
        if (!this.video.isConnected) document.body.appendChild(this.video);
        await this.video.play().catch(() => undefined);
      }
    }
  }

  async enable() {
    this.wanted = true;
    await this.acquire();
  }

  async disable() {
    this.wanted = false;
    await this.sentinel?.release().catch(() => undefined);
    this.sentinel = null;
    this.video?.pause();
  }
}
