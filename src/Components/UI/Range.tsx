import { createEffect, createSignal } from "solid-js";
import "./Range.css";
interface RangeProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange(value: number): void;
  onInput?(value: number): void;
  class?: string;
  color?: string;
}

function valueToPercentage(min: number, max: number, value: number): number {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

export function Range(p: RangeProps) {
  const [progress, setProgress] = createSignal<number>(p.value);

  createEffect(() => {
    setProgress(p.value);
  });

  return (
    <div class="range relative flex h-9 w-full overflow-clip">
      <input
        type="range"
        min={p.min}
        max={p.max}
        value={p.value}
        onChange={(e) => {
          const value = Number.parseFloat((e.target as HTMLInputElement).value);
          p.onChange(value);
        }}
        onInput={(e) => {
          const value = Number.parseFloat((e.target as HTMLInputElement).value);
          setProgress(value);
          p.onInput?.(value);
        }}
        step={p.step}
        class={"relative h-full w-full bg-gray-600"}
      />

      <div
        class={"pointer-events-none absolute top-0 bottom-0 left-0"}
        style={{ width: `${valueToPercentage(p.min, p.max, progress())}%` }}
      >
        <div
          class={`range-progress-body h-full ${p.class}`}
          style={p.color != null ? { "background-color": p.color } : {}}
        />
      </div>
    </div>
  );
}
