import { createSelector, For } from "solid-js";
import { useReaper } from "../../Data/Context";
import { Region } from "../../Data/State";

function Progress(p: { progress: number }) {
  return (
    <div
      class="absolute bottom-0 left-0 top-0 bg-gray-400 opacity-25"
      style={`width: ${p.progress}%`}
    />
  );
}

export function Regions() {
  const {
    actions: { moveToRegion },
    data: { currentTime, regions },
  } = useReaper();

  const isPlaying = createSelector(
    currentTime,
    (r: Region, t) => t >= Math.floor(r.startTime) && t <= Math.ceil(r.endTime),
  );

  const progress = (r: Region) =>
    Math.max(
      0,
      Math.min(
        100,
        ((currentTime() - r.startTime) / (r.endTime - r.startTime)) * 100,
      ),
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
              class={`relative overflow-clip btn-outlined my-1 px-5 ${
                isPlaying(region) && "selected"
              }`}
              onClick={() => moveToRegion(region)}
            >
              {isPlaying(region) && <Progress progress={progress(region)} />}
              <span class="relative">{region.name}</span>
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
