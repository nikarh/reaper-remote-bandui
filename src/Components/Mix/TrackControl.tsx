import { createEffect, createSignal } from "solid-js";

function levelToPercentage(level: number): number {
  return Math.max(0, Math.min(100, ((level + 20) / 20) * 100));
}

export function TrackControl(p: {
  track: Track;
  onMuteToggle: () => void;
  onVolumeChange: (volume: number) => void;
}) {
  const [volume, setVolume] = createSignal(p.track.volume);
  createEffect(() => {
    setVolume(p.track.volume);
  });

  const mutedClasses =
    "focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900";
  const unmutedClasses =
    "text-gray-900 bg-white focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700";

  return (
    <div class="max-w-md w-full m-1 p-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <div class="flex">
        <div class="flex-1 mr-2">
          <div class="mb-1 font-normal text-gray-700 dark:text-gray-400">
            {p.track.name}{" "}
            <span class="dark:text-gray-600">({p.track.id})</span>
          </div>
          <div class="mb-2 w-full bg-gray-200 rounded-full h-0.5 dark:bg-gray-700">
            <div
              class="bg-green-600 h-0.5 rounded-full dark:bg-green-500"
              style={`width: ${levelToPercentage(p.track.level)}%`}
            />
          </div>
          <input
            id="large-range"
            type="range"
            min="-20"
            max="0"
            value={volume()}
            onChange={(e) => {
              let value = parseFloat((e.target as HTMLInputElement).value);
              setVolume(value);
              p.onVolumeChange(value);
            }}
            step={0.1}
            class="w-full h-5 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
          />
        </div>
        <div class="flex flex-col">
          <div class="mb-1.5">
            <button
              type="button"
              class={`
                text-xs border border-gray-300 dark:border-gray-600 dark:hover:border-gray-600
                px-7 py-2
                ${p.track.mute ? mutedClasses : unmutedClasses}
              `}
              onClick={p.onMuteToggle}
            >
              M
            </button>
          </div>
          <div class="flex-1 flex items-center justify-center">
            <p class="text-xs text-gray-900 dark:text-white">
              {p.track.volume.toFixed(2)} dB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
