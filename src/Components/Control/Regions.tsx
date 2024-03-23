import { For, createSelector, createSignal } from "solid-js";
import { useReaper } from "../../Data/Context";
import {
  type RegionWithMeta,
  textColor,
  useCurrentRegion,
  useFilteredSortedRegions,
  useSortedRegions,
} from "../../Data/Selectors";
import {
  type CurrentTime,
  type Marker,
  PlayState,
  type Region,
  type RegionsMeta,
} from "../../Data/State";
import { Icons } from "../UI/Icons";
import { Toggle } from "../UI/Toggle";

import "./Regions.css";

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
      <div class="absolute top-0 right-0 bottom-0 flex items-center px-1 opacity-90">
        <p class="rounded-lg bg-neutral-900/40 p-1 font-mono text-gray-300 text-xs">
          {time(p.currentTime.seconds - p.region.startTime)} /{" "}
          {time(p.region.endTime - p.region.startTime)}
        </p>
      </div>
    </>
  );
}

function playStateClass(playState: PlayState): string {
  switch (playState) {
    case PlayState.Playing:
      return "playing";
    case PlayState.Paused:
      return "paused";
    case PlayState.Stopped:
      return "stopped";
  }
}

function markerPosition(region: Region, marker: Marker): number {
  return (
    ((marker.startTime - region.startTime) /
      (region.endTime - region.startTime)) *
    100
  );
}

function RegionList() {
  const {
    actions: { moveToRegion },
    data: { playState, currentTime, regionMarkers },
  } = useReaper();

  const currentRegion = useCurrentRegion();
  const processedRegions = useFilteredSortedRegions();

  const isPlaying = createSelector(
    currentRegion,
    (region: Region, r?: Region) => r?.id === region.id,
  );

  return (
    <div class="flex flex-col">
      <For each={processedRegions()}>
        {(region) => (
          <button
            type="button"
            class={`btn-region relative my-1 flex h-10 grow overflow-clip px-3 ${
              isPlaying(region) && `selected ${playStateClass(playState())}`
            }`}
            style={
              region.color != null ? { "background-color": region.color } : {}
            }
            onClick={() => moveToRegion(region)}
          >
            {isPlaying(region) && (
              <div
                class="absolute top-0 right-0 bottom-0 left-0 bg-black opacity-40"
                style={{
                  width: `${progress(region, currentTime().seconds)}%`,
                }}
              />
            )}

            <For each={regionMarkers()[region.id] ?? []}>
              {(marker) => (
                <div
                  class="absolute top-0 bottom-0 border-l border-solid border-red-600 opacity-50"
                  style={{
                    left: `${markerPosition(region, marker)}%`,
                    "border-color": marker.color,
                  }}
                >
                  <div
                    class={`absolute top-[-3px] text-xs bg-red-600 px-1 rounded-br-md ${textColor(
                      marker.color,
                    )}`}
                    style={{ background: marker.color }}
                  >
                    {marker.id}
                  </div>
                </div>
              )}
            </For>
            {isPlaying(region) && (
              <Progress region={region} currentTime={currentTime()} />
            )}
            <div class="absolute top-0 bottom-0 left-0.5 opacity-90 flex justify-center items-center">
              <div class="rounded-lg bg-neutral-900/40 p-1 font-normal text-base text-gray-200">
                {region.id}. {region.name}
              </div>
            </div>
          </button>
        )}
      </For>
    </div>
  );
}

function moveUp(regions: RegionWithMeta[], index: number): RegionsMeta {
  const newRegions = [...regions];

  const temp = newRegions[index];
  newRegions[index] = newRegions[index - 1];
  newRegions[index - 1] = temp;

  return newRegions.reduce((acc, r, i) => {
    acc[r.id] = {
      id: r.id,
      index: i,
      disabled: r.meta?.disabled ?? false,
    };

    return acc;
  }, {} as RegionsMeta);
}

function moveDown(regions: RegionWithMeta[], index: number): RegionsMeta {
  const newRegions = [...regions];

  const temp = newRegions[index];
  newRegions[index] = newRegions[index + 1];
  newRegions[index + 1] = temp;

  return newRegions.reduce((acc, r, i) => {
    acc[r.id] = {
      id: r.id,
      index: i,
      disabled: r.meta?.disabled ?? false,
    };

    return acc;
  }, {} as RegionsMeta);
}

function toggleEnabled(regions: RegionWithMeta[], index: number): RegionsMeta {
  const parsedMeta = regions.reduce((acc, r, i) => {
    acc[r.id] = {
      id: r.id,
      index: i,
      disabled: r.meta?.disabled ?? false,
    };

    return acc;
  }, {} as RegionsMeta);

  parsedMeta[regions[index].id].disabled = !(
    regions[index].meta?.disabled ?? false
  );

  return parsedMeta;
}

function RegionEditor() {
  const {
    actions: { updateRegionMeta },
  } = useReaper();

  const processedRegions = useSortedRegions();

  return (
    <div class="flex flex-col">
      <For each={processedRegions()}>
        {(region, i) => (
          <div class="flex flex-row items-center transition-transform">
            <button
              type="button"
              class="btn-round mr-1"
              disabled={i() === 0}
              onclick={() => updateRegionMeta(moveUp(processedRegions(), i()))}
            >
              <Icons.Up />
            </button>
            <button
              type="button"
              class="btn-round mr-1"
              disabled={i() === processedRegions().length - 1}
              onclick={() =>
                updateRegionMeta(moveDown(processedRegions(), i()))
              }
            >
              <Icons.Down />
            </button>
            <button
              type="button"
              class={`btn-region bg-gray-600 hover:text-gray-200 relative my-1 flex h-10 grow overflow-clip px-3 ${
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
                <div class="absolute top-0 right-0 bottom-0 flex content-center items-center px-3 opacity-70">
                  <Icons.Checked class="mr-1 h-6 w-6" />
                </div>
              )}
            </button>
          </div>
        )}
      </For>
    </div>
  );
}

export function Regions() {
  const [isEditing, setEditing] = createSignal(false);

  return (
    <div>
      <h2 class="mb-2 flex items-center font-extrabold text-m text-white leading-none tracking-tight">
        <span class="grow">
          {isEditing() && "Regions"}
          {!isEditing() && "Move to Region"}
        </span>
        <Toggle label="Edit" value={isEditing()} onChange={setEditing} />
      </h2>

      {isEditing() && <RegionEditor />}
      {!isEditing() && <RegionList />}
    </div>
  );
}
