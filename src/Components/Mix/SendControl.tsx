import { createSignal } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import type { Send, Track } from "../../Data/State";
import { Range } from "../UI/Range";

function levelToPercentage(level: number): number {
  return Math.max(0, Math.min(100, dbToNormalized(level / 10) * 100));
}

function normalizedToDb(level: number): number {
  if (level < 0.00000002980232) {
    return Number.NEGATIVE_INFINITY;
  }
  return Math.log(level) * 8.68588963806;
}

function dbToNormalized(level: number): number {
  if (level === Number.NEGATIVE_INFINITY) {
    return 0;
  }
  return Math.exp(level / 8.68588963806);
}

function Level(p: { level: number; color: string }) {
  return (
    <div class="h-1 w-full bg-gray-200 bg-gray-600/50">
      <div
        class="h-full rounded-full"
        style={{
          width: `${p.level}%`,
          "background-color": p.color,
          filter: "invert(0.9)",
        }}
      />
    </div>
  );
}

interface SliderProps {
  label?: JSX.Element;
  value: number;
  color?: string;
  onChange(value: number): void;
  peak: number;
}

function Slider(p: SliderProps) {
  const [input, setInput] = createSignal<number | undefined>(undefined);

  return (
    <div class="relative flex grow overflow-clip rounded-lg">
      <Range
        min={0}
        max={1}
        step={0.01}
        value={p.value}
        onChange={(value) => {
          p.onChange(value);
          setInput(undefined);
        }}
        onInput={setInput}
        color={p.color}
      />
      {p.label != null && (
        <div class="pointer-events-none absolute top-0.5 bottom-0 left-0.5 opacity-70">
          <div class="rounded-lg bg-neutral-900/40 p-1 font-normal text-gray-200">
            {p.label}
          </div>
        </div>
      )}

      <div class="pointer-events-none absolute top-0 right-2 bottom-0 flex items-center opacity-70">
        <p
          class={`text-white text-xs ${
            input() != null ? "text-gray-400" : ""
          } rounded-lg bg-neutral-900/40 p-1 font-mono`}
        >
          {input() == null && normalizedToDb(p.value).toFixed(2)}
          {input() != null && normalizedToDb(input() ?? 0).toFixed(2)} dB
        </p>
      </div>

      <div class="pointer-events-none absolute right-0 bottom-0 left-0">
        <Level level={p.peak} color={p.color ?? "red"} />
      </div>
    </div>
  );
}

interface SendControlProps {
  send: Send;
  track: Track;
  onMuteToggle: () => void;
  onVolumeChange: (volume: number) => void;
}

export function SendControl(p: SendControlProps) {
  return (
    <div class="my-3 flex rounded-lg border-gray-700 bg-gray-800 p-2 shadow">
      <Slider
        label={
          <>
            {p.track.name} <span class="text-gray-400">({p.track.id})</span>
          </>
        }
        value={p.send.volume}
        onChange={p.onVolumeChange}
        peak={levelToPercentage(p.track.peakVolume) * p.send.volume}
        color={p.track.color}
      />
      <button
        type="button"
        class={`${
          p.send.mute ? "btn-mute-red" : "btn-mute"
        } ml-5 px-7 py-2 text-xs`}
        onClick={p.onMuteToggle}
      >
        M
      </button>
    </div>
  );
}

interface OutputControlProps {
  track: Track;
  onVolumeChange: (volume: number) => void;
}

export function OutputControl(p: OutputControlProps) {
  return (
    <div class="mb-3 rounded-lg border border-gray-700 bg-gray-700 p-2 shadow">
      <div class="mb-1 flex font-normal text-gray-400">
        <div class="flex-1">
          <b>Output:</b> {p.track.name}{" "}
          <span class="text-gray-500">({p.track.id})</span>
        </div>
        <div class="font-small text-gray-500">
          Peak: {(p.track.peakVolume / 10).toFixed(2)} dB
        </div>
      </div>

      <Slider
        value={p.track.volume}
        onChange={p.onVolumeChange}
        peak={levelToPercentage(p.track.peakVolume)}
        color={p.track.color}
      />
    </div>
  );
}
