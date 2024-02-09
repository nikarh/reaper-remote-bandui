import { createSelector, For } from "solid-js";
import { useReaper } from "../../Data/Context";
import { CurrentTime, Region } from "../../Data/State";

function progress(region: Region, currentTime: number): number {
  return Math.max(
    0,
    Math.min(
      100,
      ((currentTime - region.startTime) / (region.endTime - region.startTime)) *
        100,
    ),
  );
}

function time(totalSeconds: number): string {
  if (totalSeconds < 1) {
    return "0:00";
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function Progress(p: { region: Region; currentTime: CurrentTime }) {
  return (
    <>
      <div
        class="absolute bottom-0 left-0 top-0 right-0 bg-gray-400 opacity-25"
        style={`width: ${progress(p.region, p.currentTime.seconds)}%`}
      />

      <div class="absolute top-0 bottom-0 right-0 flex items-center opacity-70 px-3">
        <p class="text-xs text-gray-400 bg-neutral-900/40 rounded-lg p-1 font-mono">
          {time(p.currentTime.seconds)} / {p.currentTime.beats}
        </p>
      </div>
    </>
  );
}

export function Regions() {
  const {
    actions: { moveToRegion },
    data: { currentTime, regions },
  } = useReaper();

  const isPlaying = createSelector(
    currentTime,
    (r: Region, { seconds: t }) =>
      t >= Math.floor(r.startTime) && t <= Math.ceil(r.endTime),
  );

  return (
    <div>
      <h2 class="mb-2 text-m font-extrabold leading-none tracking-tight text-gray-900 dark:text-white">
        Move to region
      </h2>
      <div class="flex flex-col">
        <For each={regions()}>
          {(region) => (
            <button
              type="button"
              class={`relative grow flex h-10 overflow-clip btn-outlined my-1 px-3 ${
                isPlaying(region) && "selected"
              }`}
              onClick={() => moveToRegion(region)}
            >
              {isPlaying(region) && (
                <Progress region={region} currentTime={currentTime()} />
              )}

              <span class="relative">
                {region.id}. {region.name}
              </span>
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
