import { For } from "solid-js";
export interface OutputTrack {
  id: number;
  name: string;
}

export function OutputSelector(p: {
  tracks: OutputTrack[];
  selected: number;
  onSelected: (id: number) => void;
}) {
  let selectableClasses =
    "text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white";
  let selectedClasses =
    "bg-gray-200 text-blue-800 dark:text-white dark:bg-gray-500";

  return (
    <div class="flex justify-center rounded-md shadow-sm" role="group">
      <For each={p.tracks}>
        {(track, i) => (
          <button
            type="button"
            class={`
              px-4 py-2 text-sm font-medium
              ${(i() == 0) ? "rounded-l" : ""}
              ${(i() == p.tracks.length - 1) ? "rounded-r" : ""}
              ${track.id == p.selected ? selectedClasses : selectableClasses}
            `}
            onClick={() => p.onSelected(track.id)}
          >
            {track.name}
          </button>
        )}
      </For>
    </div>
  );
}
