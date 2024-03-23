import { createMemo } from "solid-js";
import { useReaper } from "./Context";
import type {
  NavigationMarker,
  Region,
  RegionMeta,
  RegionsMarkers,
  RegionsMeta,
} from "./State";

export interface RegionWithMeta extends Region {
  meta?: RegionMeta;
}

function filterRegions(regions: RegionWithMeta[]): RegionWithMeta[] {
  return regions.filter((r) => !(r.meta?.disabled ?? false));
}

function prepareRegions(
  regions: Region[],
  meta: RegionsMeta,
): RegionWithMeta[] {
  const result = regions.map((r) => ({ ...r, meta: meta[r.id] }));
  result.sort(
    (a, b) => (a.meta?.index ?? 10000 + a.id) - (b.meta?.index ?? 10000 + b.id),
  );

  return result;
}

export function useSortedRegions() {
  const {
    data: { regions, regionMeta },
  } = useReaper();
  return createMemo(() => prepareRegions(regions(), regionMeta()));
}

export function useFilteredSortedRegions() {
  const sortedRegions = useSortedRegions();

  return createMemo(() => filterRegions(sortedRegions()));
}

export function useCurrentRegion() {
  const {
    data: { currentTime, regions },
  } = useReaper();

  return createMemo(() => {
    const t = currentTime().seconds;

    return regions().find(
      (r) =>
        Math.max(t, 0) >= Math.floor(r.startTime) &&
        Math.max(t, 0) <= Math.ceil(r.endTime),
    );
  });
}

function hasStartMarker(region: Region, markers: RegionsMarkers): boolean {
  const firstMarker = (markers[region.id] ?? [])[0];

  if (firstMarker == null) {
    return false;
  }

  return Math.abs(region.startTime - firstMarker.startTime) < 0.01;
}

export function useNavigationMarkers() {
  const {
    data: { regionMarkers },
  } = useReaper();

  const regions = useFilteredSortedRegions();

  return createMemo<Record<number, NavigationMarker[]>>(() => {
    const markers = regionMarkers();
    const navigationMarkers: Record<number, NavigationMarker[]> = {};

    // iterate over regions
    for (const region of regions()) {
      const realMarkers: NavigationMarker[] = (markers[region.id] ?? []).map(
        (marker) => ({
          ...marker,
          kind: "marker",
        }),
      );

      if (hasStartMarker(region, markers)) {
        navigationMarkers[region.id] = realMarkers;
      } else {
        navigationMarkers[region.id] = [
          {
            kind: "regionStart",
            id: region.id,
            startTime: region.startTime,
            name: region.name,
            color: region.color,
          },
          ...realMarkers,
        ];
      }
    }

    return navigationMarkers;
  });
}

export function usePreviousMarker() {
  const currentRegion = useCurrentRegion();
  const allRegions = useFilteredSortedRegions();
  const navigationMarkers = useNavigationMarkers();
  const {
    data: { currentTime },
  } = useReaper();

  return createMemo(() => {
    const current = currentRegion();
    const markers = navigationMarkers();
    const regions = allRegions();
    const now = currentTime().seconds;

    if (current == null) {
      return undefined;
    }

    const previousMarkerInRegion = (markers[current.id] ?? []).findLast(
      (m) => now - m.startTime > 0.1,
    );

    if (previousMarkerInRegion != null) {
      return previousMarkerInRegion;
    }

    const previous = regions[regions.findIndex((r) => r.id === current.id) - 1];
    return (markers[previous?.id] ?? []).slice(-1)[0];
  });
}

export function useCurrentMarker() {
  const currentRegion = useCurrentRegion();
  const {
    data: { currentTime, regionMarkers },
  } = useReaper();

  return createMemo(() => {
    const current = currentRegion();
    const markers = regionMarkers();
    const now = currentTime().seconds;

    if (current == null) {
      return undefined;
    }

    const previousMarkerInRegion = (markers[current.id] ?? []).findLast(
      (m) => now - m.startTime > -0.001,
    );

    return previousMarkerInRegion;
  });
}

export function useNextMarker() {
  const currentRegion = useCurrentRegion();
  const allRegions = useFilteredSortedRegions();
  const navigationMarkers = useNavigationMarkers();
  const {
    data: { currentTime },
  } = useReaper();

  return createMemo(() => {
    const current = currentRegion();
    const markers = navigationMarkers();
    const regions = allRegions();
    const now = currentTime().seconds;

    if (current == null) {
      return undefined;
    }

    const nextMarkerInRegion = (markers[current.id] ?? []).find(
      (m) => m.startTime - now > 0.01,
    );

    if (nextMarkerInRegion != null) {
      return nextMarkerInRegion;
    }

    const currentIndex = regions.findIndex((r) => r.id === current.id);
    if (currentIndex < 0) {
      return undefined;
    }

    const next = regions[currentIndex + 1];
    return (markers[next?.id] ?? [])[0];
  });
}

export function textColor(color?: string): "text-white" | "text-black" {
  if (color == null) {
    return "text-white";
  }

  const squareDist =
    color
      .match(/^#(..)(..)(..)$/)
      ?.slice(1)
      ?.map((c) => Number.parseInt(c, 16) ** 2)
      ?.reduce((acc, c) => acc + c, 0) ?? 0;

  if (squareDist > (255 * 255 * 3) / 2) {
    return "text-black";
  }

  return "text-white";
}
