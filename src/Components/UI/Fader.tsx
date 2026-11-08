import { createSignal, type JSX, onCleanup } from "solid-js";
import {
  dbToPosition,
  formatDb,
  gainToDb,
  gainToPosition,
  positionToDb,
  positionToGain,
  UNITY_POSITION,
} from "../../Data/FaderLaw";

/** Changes are sent at most this often while dragging. */
const SEND_INTERVAL_MS = 50;
/** After release the local value is kept this long, so late echoes from REAPER don't make the fader jump back. */
const SETTLE_MS = 800;
/** Around 0 dB the fader sticks to exactly 0 dB, as a fraction of its travel. */
const DETENT = 0.008;
/** How far a pointer has to move horizontally before it counts as a drag and not a tap. */
const DRAG_THRESHOLD_PX = 4;
/** Arrow keys move the fader by this much of its travel; Page Up / Page Down by ten times as much. */
const KEY_STEP = 0.01;

function detent(raw: number): number {
  return Math.abs(raw - UNITY_POSITION) < DETENT
    ? UNITY_POSITION
    : Math.max(0, Math.min(1, raw));
}

interface FaderProps {
  /** Linear gain, 1 is 0 dB. */
  gain: number;
  onChange(gain: number): void;
  color?: string;
  label?: JSX.Element;
  /** Meter level in dB. */
  meterDb?: number;
}

/**
 * Horizontal fader for a gain on a dB scale (see FaderLaw). Only horizontal drags move it, relative to where it is:
 * taps never change the level and vertical swipes scroll the page (touch-action: pan-y).
 */
export function Fader(p: FaderProps) {
  // Raw position (without the detent) while dragging and for a moment after release.
  const [dragged, setDragged] = createSignal<number | undefined>();
  let element: HTMLDivElement | undefined;
  let pointer: { id: number; startX: number; lastX: number } | undefined;
  let dragging = false;
  let lastSent = 0;
  let settle: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => clearTimeout(settle));

  const position = () => {
    const d = dragged();
    return d != null ? detent(d) : gainToPosition(p.gain);
  };
  const db = () => {
    const d = dragged();
    return d != null ? positionToDb(detent(d)) : gainToDb(p.gain);
  };

  function send(force: boolean) {
    const d = dragged();
    if (d == null) return;
    const now = Date.now();
    if (force || now - lastSent >= SEND_INTERVAL_MS) {
      lastSent = now;
      p.onChange(positionToGain(detent(d)));
    }
  }

  function move(raw: number) {
    const before = dragged() ?? gainToPosition(p.gain);
    const after = Math.max(-DETENT, Math.min(1 + DETENT, raw));
    if (detent(after) === UNITY_POSITION && detent(before) !== UNITY_POSITION) {
      navigator.vibrate?.(10);
    }
    setDragged(after);
  }

  function release() {
    send(true);
    clearTimeout(settle);
    settle = setTimeout(() => setDragged(undefined), SETTLE_MS);
  }

  function start() {
    clearTimeout(settle);
    if (dragged() == null) {
      setDragged(gainToPosition(p.gain));
    }
  }

  const onPointerDown: JSX.EventHandler<HTMLDivElement, PointerEvent> = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointer = { id: e.pointerId, startX: e.clientX, lastX: e.clientX };
    dragging = false;
  };

  const onPointerMove: JSX.EventHandler<HTMLDivElement, PointerEvent> = (e) => {
    if (pointer == null || e.pointerId !== pointer.id || element == null) {
      return;
    }
    if (!dragging) {
      if (Math.abs(e.clientX - pointer.startX) < DRAG_THRESHOLD_PX) return;
      dragging = true;
      element.setPointerCapture(e.pointerId);
      start();
    }
    const width = Math.max(1, element.getBoundingClientRect().width);
    const before = dragged() ?? gainToPosition(p.gain);
    move(before + (e.clientX - pointer.lastX) / width);
    pointer.lastX = e.clientX;
    send(false);
  };

  const onPointerEnd: JSX.EventHandler<HTMLDivElement, PointerEvent> = (e) => {
    if (pointer == null || e.pointerId !== pointer.id) return;
    pointer = undefined;
    if (dragging) {
      dragging = false;
      release();
    }
  };

  const onKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (e) => {
    const steps: Record<string, number> = {
      ArrowLeft: -KEY_STEP,
      ArrowDown: -KEY_STEP,
      ArrowRight: KEY_STEP,
      ArrowUp: KEY_STEP,
      PageDown: -KEY_STEP * 10,
      PageUp: KEY_STEP * 10,
    };
    let next: number;
    if (e.key in steps) {
      next = detent(position() + steps[e.key]);
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = 1;
    } else {
      return;
    }
    e.preventDefault();
    start();
    move(next);
    release();
  };

  return (
    <div
      ref={element}
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={Number(position().toFixed(3))}
      aria-valuetext={`${formatDb(db())} dB`}
      class="fader relative h-10 w-full grow cursor-ew-resize touch-pan-y select-none overflow-clip rounded-lg bg-gray-600 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onLostPointerCapture={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      <div
        class="pointer-events-none absolute top-0 bottom-0 left-0 bg-blue-500"
        style={{
          width: `${position() * 100}%`,
          ...(p.color != null ? { "background-color": p.color } : {}),
        }}
      />
      {/* 0 dB mark */}
      <div
        class="pointer-events-none absolute top-0 bottom-0 w-px bg-white/35"
        style={{ left: `${UNITY_POSITION * 100}%` }}
      />
      {p.label != null && (
        <div class="pointer-events-none absolute top-0.5 bottom-0 left-0.5 opacity-70">
          <div class="rounded-lg bg-neutral-900/40 p-1 font-normal text-gray-200">
            {p.label}
          </div>
        </div>
      )}
      <div class="pointer-events-none absolute top-0 right-2 bottom-0 flex items-center">
        <p
          data-testid="db"
          class="rounded-lg bg-neutral-900/60 p-1 font-mono text-xs"
          classList={{
            "text-yellow-300": dragged() != null,
            "text-white": dragged() == null,
          }}
        >
          {formatDb(db())} dB
        </p>
      </div>
      {p.meterDb != null && (
        <div class="pointer-events-none absolute right-0 bottom-0 left-0 h-1 bg-gray-600/50">
          <div
            class="h-full rounded-full"
            style={{
              width: `${dbToPosition(p.meterDb) * 100}%`,
              "background-color": p.color ?? "red",
              filter: "invert(0.9)",
            }}
          />
        </div>
      )}
    </div>
  );
}
