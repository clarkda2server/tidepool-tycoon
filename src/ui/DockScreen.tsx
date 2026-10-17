import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { cast } from '../core/actions';
import { DockScene } from '../render/dockScene';
import { RenderLoop } from '../render/loop';
import type { GameStore } from './store';

const HOLD_DELAY_MS = 350; // press longer than this to start auto-casting
const AUTO_CASTS_PER_SEC = 2;

interface Floater { id: number; x: number; y: number; text: string }

export function DockScreen({ store, banner }: { store: GameStore; banner?: ComponentChildren }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<DockScene | null>(null);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [held, setHeld] = useState(false);
  const holdTimers = useRef<{ start?: ReturnType<typeof setTimeout>; repeat?: ReturnType<typeof setInterval> }>({});
  const floaterId = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const scene = new DockScene(canvas);
    sceneRef.current = scene;
    scene.reduceMotion = store.state.settings.reduceMotion;
    scene.resize();
    const loop = new RenderLoop((t, dt) => scene.draw(t, dt), 30);
    loop.start();
    const ro = new ResizeObserver(() => scene.resize());
    ro.observe(canvas);
    return () => {
      loop.stop();
      ro.disconnect();
    };
  }, [store]);

  const doCast = () => {
    let gained = 0;
    store.update((s) => (gained = cast(s)));
    sceneRef.current?.onCast();
    store.platform.haptics.impact('light');
    const canvas = canvasRef.current;
    if (canvas) {
      const r = canvas.getBoundingClientRect();
      const id = ++floaterId.current;
      // Spawn near the float, jittered so rapid casts don't stack on top of each other.
      const f: Floater = { id, x: r.width * 0.62 + (Math.random() - 0.5) * 40, y: r.height * 0.55, text: `+${gained}` };
      setFloaters((list) => [...list.slice(-8), f]);
      setTimeout(() => setFloaters((list) => list.filter((x) => x.id !== id)), 950);
    }
  };

  const stopHold = () => {
    clearTimeout(holdTimers.current.start);
    clearInterval(holdTimers.current.repeat);
    holdTimers.current = {};
    setHeld(false);
  };

  const onDown = (e: PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    doCast();
    holdTimers.current.start = setTimeout(() => {
      setHeld(true);
      holdTimers.current.repeat = setInterval(doCast, 1000 / AUTO_CASTS_PER_SEC);
    }, HOLD_DELAY_MS);
  };

  useEffect(() => stopHold, []);

  return (
    <>
      <div class="scene">
        <canvas ref={canvasRef} aria-label="Moonlit dock" />
        {floaters.map((f) => (
          <div key={f.id} class="float-num" style={{ left: `${f.x}px`, top: `${f.y}px` }}>
            {f.text}
          </div>
        ))}
      </div>
      <div class="controls">
        {banner}
        <button
          class={`cast-btn${held ? ' held' : ''}`}
          onPointerDown={onDown}
          onPointerUp={stopHold}
          onPointerCancel={stopHold}
          onLostPointerCapture={stopHold}
          onContextMenu={(e) => e.preventDefault()}
        >
          CAST
        </button>
        <div class="hint">{held ? 'Auto-casting…' : 'Tap to cast · hold to auto-cast'}</div>
      </div>
    </>
  );
}
