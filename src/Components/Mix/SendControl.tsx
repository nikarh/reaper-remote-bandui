import { createSignal } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Send, Track } from "../../Data/State";
import { Range } from "../UI/Range";

function levelToPercentage(level: number): number {
  return Math.max(0, Math.min(100, dbToNormalized(level / 10) * 100));
}

function normalizedToDb(level: number): number {
  if (level < 0.00000002980232) {
    return -Infinity;
  }
  return Math.log(level) * 8.68588963806;
}

function dbToNormalized(level: number): number {
  if (level == -Infinity) {
    return 0;
  }
  return Math.exp(level / 8.68588963806);
}

function Level(p: { level: number; color: string }) {
  return (
    <div class="w-full bg-gray-200 h-1 dark:bg-gray-600/50">
      <div
        class="h-full rounded-full"
        style={`width: ${p.level}%; background-color: ${p.color}; filter: invert(0.9);`}
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
    <div class="relative grow flex rounded-lg overflow-clip">
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
        <div class="absolute bottom-0 left-0.5 top-0.5 pointer-events-none opacity-70">
          <div class="font-normal text-gray-700 dark:text-gray-200 bg-neutral-900/40 rounded-lg p-1">
            {p.label}
          </div>
        </div>
      )}

      <div class="absolute right-2 top-0 bottom-0 pointer-events-none flex items-center opacity-70">
        <p
          class={`text-xs text-white ${
            input() != null ? "text-gray-400" : ""
          } bg-neutral-900/40 rounded-lg p-1 font-mono`}
        >
          {input() == null && normalizedToDb(p.value).toFixed(2)}
          {input() != null && normalizedToDb(input() ?? 0).toFixed(2)} dB
        </p>
      </div>

      <div class="absolute left-0 bottom-0 right-0 pointer-events-none">
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
    <div class="my-3 p-2 bg-white  rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 flex">
      <Slider
        label={
          <>
            {p.track.name}{" "}
            <span class="dark:text-gray-400">({p.track.id})</span>
          </>
        }
        value={p.send.volume}
        onChange={p.onVolumeChange}
        peak={levelToPercentage(p.track.peakVolume) * p.send.volume}
        color={p.track.color}
      />
      <button
        type="button"
        class={`text-xs ml-5 px-7 py-2 ${
          p.send.mute ? "btn-outlined-red" : "btn-outlined"
        }`}
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
    <div class="p-2 mb-3 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-700 dark:border-gray-700">
      <div class="flex mb-1 font-normal text-gray-700 dark:text-gray-400">
        <div class="flex-1">
          <b>Output:</b> {p.track.name}{" "}
          <span class="dark:text-gray-500">({p.track.id})</span>
        </div>
        <div class="font-small text-gray-500 dark:text-gray-500">
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
