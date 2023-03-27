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

function Level(p: { level: number }) {
  return (
    <div class="mb-2 w-full bg-gray-200 h-0.5 dark:bg-gray-600">
      <div
        class="bg-green-600 h-0.5 rounded-full dark:bg-green-500"
        style={`width: ${p.level}%`}
      />
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
    <div class="my-2 p-1 pl-2 pr-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <div class="flex">
        <div class="flex-1 mr-2">
          <div class="mb-1 font-normal text-gray-700 dark:text-gray-400">
            {p.track.name}{" "}
            <span class="dark:text-gray-600">({p.track.id})</span>
          </div>
          <Level
            level={levelToPercentage(p.track.peakVolume) * p.send.volume}
          />
          <Range
            min={0}
            max={1}
            step={0.01}
            value={p.send.volume}
            onChange={p.onVolumeChange}
          />
        </div>
        <div class="flex flex-col">
          <div class="mb-1.5">
            <button
              type="button"
              class={`
                text-xs px-7 py-2
                ${p.send.mute ? "btn-outlined-red" : "btn-outlined"}
              `}
              onClick={p.onMuteToggle}
            >
              M
            </button>
          </div>
          <div class="flex-1 flex items-center justify-center">
            <p class="text-xs text-gray-900 dark:text-white">
              {normalizedToDb(p.send.volume).toFixed(2)} dB
            </p>
          </div>
        </div>
      </div>
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
          {(p.track.peakVolume / 10).toFixed(2)} dB
        </div>
      </div>
      <Level level={levelToPercentage(p.track.peakVolume)} />
      <Range
        min={0}
        max={1}
        step={0.01}
        value={p.track.volume}
        onChange={p.onVolumeChange}
      />
    </div>
  );
}
