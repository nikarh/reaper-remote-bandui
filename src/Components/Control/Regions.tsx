import {
  createMemo,
  createSelector,
  createSignal,
  For,
  Match,
  Switch,
} from "solid-js";
import { useReaper } from "../../Data/Context";
import { CurrentTime, ParsedMeta, Region, RegionMeta } from "../../Data/State";
import { Icons } from "../UI/Icons";

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
        class="absolute bottom-0 left-0 top-0 right-0 bg-black opacity-40"
        style={`width: ${progress(p.region, p.currentTime.seconds)}%`}
      />

      <div class="absolute top-0 bottom-0 right-0 flex items-center opacity-90 px-1">
        <p class="text-xs text-gray-300 bg-neutral-900/40 rounded-lg p-1 font-mono">
          {time(p.currentTime.seconds)} / {p.currentTime.beats}
        </p>
      </div>
    </>
  );
}

interface RegionWithMeta extends Region {
  meta?: RegionMeta;
}

function filterRegions(regions: RegionWithMeta[]): Region[] {
  return regions.filter((r) => !(r.meta?.disabled ?? false));
}

function prepareRegions(regions: Region[], meta: ParsedMeta): RegionWithMeta[] {
  let result = regions.map((r) => ({ ...r, meta: meta[r.id] }));
  result.sort(
    (a, b) => (a.meta?.index ?? 10000 + a.id) - (b.meta?.index ?? 10000 + b.id),
  );

  return result;
}

function RegionList() {
  const {
    actions: { moveToRegion },
    data: { currentTime, regions, regionMeta },
  } = useReaper();

  const isPlaying = createSelector(
    currentTime,
    (r: Region, { seconds: t }) =>
      t >= Math.floor(r.startTime) && t <= Math.ceil(r.endTime),
  );

  const processedRegions = createMemo(() =>
    filterRegions(prepareRegions(regions(), regionMeta())),
  );

  return (
    <div class="flex flex-col">
      <For each={processedRegions()}>
        {(region) => (
          <button
            type="button"
            class={`hover:brightness-125 relative grow flex h-10 overflow-clip btn-outlined my-1 px-3 ${
              isPlaying(region) && "selected"
            }`}
            style={`${region.color != null ? `background-color: ${region.color};` : ""}`}
            onClick={() => moveToRegion(region)}
          >
            {isPlaying(region) && (
              <Progress region={region} currentTime={currentTime()} />
            )}

            <div class="absolute bottom-0 left-0.5 top-1 opacity-90">
              <div class="text-base font-normal text-gray-700 dark:text-gray-200 bg-neutral-900/40 rounded-lg p-1">
                {region.id}. {region.name}
              </div>
            </div>
          </button>
        )}
      </For>
    </div>
  );
}

function moveUp(regions: RegionWithMeta[], index: number): ParsedMeta {
  let newRegions = [...regions];

  let temp = newRegions[index];
  newRegions[index] = newRegions[index - 1];
  newRegions[index - 1] = temp;

  return newRegions.reduce((acc, r, i) => {
    acc[r.id] = {
      id: r.id,
      index: i,
      disabled: r.meta?.disabled ?? false,
    };

    return acc;
  }, {} as ParsedMeta);
}

function moveDown(regions: RegionWithMeta[], index: number): ParsedMeta {
  let newRegions = [...regions];

  let temp = newRegions[index];
  newRegions[index] = newRegions[index + 1];
  newRegions[index + 1] = temp;

  return newRegions.reduce((acc, r, i) => {
    acc[r.id] = {
      id: r.id,
      index: i,
      disabled: r.meta?.disabled ?? false,
    };

    return acc;
  }, {} as ParsedMeta);
}

function toggleEnabled(regions: RegionWithMeta[], index: number): ParsedMeta {
  let parsedMeta = regions.reduce((acc, r, i) => {
    acc[r.id] = {
      id: r.id,
      index: i,
      disabled: r.meta?.disabled ?? false,
    };

    return acc;
  }, {} as ParsedMeta);

  parsedMeta[regions[index].id].disabled = !(
    regions[index].meta?.disabled ?? false
  );

  return parsedMeta;
}

function RegionEditor() {
  const {
    actions: { updateRegionMeta },
    data: { regions, regionMeta },
  } = useReaper();

  const processedRegions = createMemo(() =>
    prepareRegions(regions(), regionMeta()),
  );

  return (
    <div class="flex flex-col">
      <For each={processedRegions()}>
        {(region, i) => (
          <div class="flex flex-row items-center transition-transform">
            <button
              type="button"
              class="btn-round mr-1"
              disabled={i() == 0}
              onclick={() => updateRegionMeta(moveUp(processedRegions(), i()))}
            >
              <Icons.Up />
            </button>
            <button
              type="button"
              class="btn-round mr-1"
              disabled={i() == processedRegions().length - 1}
              onclick={() =>
                updateRegionMeta(moveDown(processedRegions(), i()))
              }
            >
              <Icons.Down />
            </button>
            <button
              type="button"
              class={`relative grow flex h-10 overflow-clip btn-outlined btn-checkbox my-1 px-3 ${
                !region.meta?.disabled && "selected"
              }`}
              onclick={() =>
                updateRegionMeta(toggleEnabled(processedRegions(), i()))
              }
            >
              <span class="relative">
                {region.id}. {region.name}
              </span>

              {!region.meta?.disabled && (
                <div class="absolute top-0 bottom-0 right-0 items-center opacity-70 px-3 flex content-center">
                  <Icons.Checked class="w-6 h-6 mr-1" />
                </div>
              )}
            </button>
          </div>
        )}
      </For>
    </div>
  );
}

interface ToggleProps {
  value: boolean;
  onChange(value: boolean): void;
}

function Toggle(p: ToggleProps) {
  return (
    <label class="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={p.value}
        onChange={(e) => p.onChange(e.currentTarget.checked)}
        class="sr-only peer"
      />
      <span class="me-2 text-sm font-medium text-gray-900 dark:text-gray-300">
        Edit
      </span>
      <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    </label>
  );
}

export function Regions() {
  const [isEditing, setEditing] = createSignal(false);

  return (
    <div>
      <h2 class="mb-2 text-m font-extrabold leading-none tracking-tight text-gray-900 dark:text-white flex items-center">
        <span class="grow">
          {isEditing() && "Regions"}
          {!isEditing() && "Move to Region"}
        </span>
        <Toggle value={isEditing()} onChange={setEditing} />
      </h2>

      {isEditing() && <RegionEditor />}
      {!isEditing() && <RegionList />}
    </div>
  );
}
