import deepEqual from "deep-equal";
import {
  type Accessor,
  type JSX,
  createComputed,
  createContext,
  createMemo,
  createSignal,
  onCleanup,
  useContext,
} from "solid-js";
import { type Store, createStore, produce, reconcile } from "solid-js/store";

import { initializeClient } from "./ClientLoop";
import { onReply } from "./ResponseParser";
import {
  type CurrentTime,
  type Marker,
  type NavigationMarker,
  PlayState,
  type Region,
  type RegionsMarkers,
  type RegionsMeta,
  type Send,
  type Track,
} from "./State";

interface Reaper {
  data: {
    currentTime: Accessor<CurrentTime>;
    playState: Accessor<PlayState>;
    recording: Accessor<boolean>;
    repeat: Accessor<boolean>;
    regions: Accessor<Region[]>;
    regionMeta: Accessor<RegionsMeta>;
    regionMarkers: Accessor<RegionsMarkers>;
    tracks: Store<Track[]>;
    sends: Store<Send[]>;
  };
  actions: {
    subscribe(request: string, interval: number): () => void;
    moveToRegion(region: Region): void;
    moveToMarker(marker?: Marker): void;
    toggleSendMute(send: Send): void;
    toggleRepeat(): void;
    setSendVolume(send: Send, volume: number): void;
    setOutputVolume(id: number, volume: number): void;
    updateRegionMeta(meta: RegionsMeta): void;
    play(): void;
    pause(): void;
    stop(): void;
    record(): void;
  };
}

const ReaperContext = createContext<Reaper>({
  data: {
    currentTime: () => ({ seconds: 0, beats: "0.0.0" }),
    playState: () => PlayState.Stopped,
    recording: () => false,
    repeat: () => false,
    regions: () => [],
    regionMeta: () => ({}),
    regionMarkers: () => ({}),
    tracks: [],
    sends: [],
  },
  actions: {
    subscribe: () => () => {},
    moveToRegion: () => {},
    moveToMarker: () => {},
    toggleSendMute: () => {},
    toggleRepeat: () => {},
    setSendVolume: () => {},
    setOutputVolume: () => {},
    updateRegionMeta: () => {},
    play: () => {},
    pause: () => {},
    stop: () => {},
    record: () => {},
  },
});

export interface ReaperProps {
  interval: number;
  subscriptions: {
    request: string;
    interval: number;
  }[];
  children: JSX.Element;
}

function parseRegionMeta(meta: string): RegionsMeta {
  const parsed = meta.split(",").map((item, index) => {
    const disabled = item.length > 0 && item[0] === "0";
    const id = Number.parseInt(item.slice(1), 10);

    return {
      id,
      index,
      disabled,
    };
  });

  return parsed.reduce((acc: RegionsMeta, next) => {
    acc[next.id] = next;
    return acc;
  }, {});
}

function serializeRegionMeta(meta: RegionsMeta): string {
  const values = Object.values(meta);
  values.sort((a, b) => a.index - b.index);
  return values
    .map(({ id, disabled }) => `${disabled ? "0" : "1"}${id}`)
    .join(",");
}

export function ReaperProvider(p: ReaperProps) {
  const [currentTime, setCurrentTime] = createSignal(
    {
      seconds: 0,
      beats: "0.0.0",
    },
    {
      equals: deepEqual,
    },
  );
  const [playState, setPlayState] = createSignal(PlayState.Stopped);
  const [repeat, setRepeat] = createSignal(false);
  const [recording, setRecording] = createSignal(false);
  const [regions, setRegions] = createSignal<Region[]>([], {
    equals: deepEqual,
  });
  const [markers, setMarkers] = createSignal<Marker[]>([], {
    equals: deepEqual,
  });
  const [tracks, setTracks] = createStore<Track[]>([]);
  const [sends, setSends] = createStore<Send[]>([]);

  const [regionRawMeta, setRawRegionMeta] = createSignal<string>("");
  const [regionMeta, setRegionMeta] = createSignal<RegionsMeta>({});

  const regionMarkers = createMemo<RegionsMarkers>(() =>
    regions()
      .map((region) => ({
        id: region.id,
        markers: markers().filter(
          ({ startTime }) =>
            startTime >= region.startTime && startTime <= region.endTime,
        ),
      }))
      .reduce((acc, { id, markers }) => {
        acc[id] = markers;
        return acc;
      }, {} as RegionsMarkers),
  );

  createComputed(() => setRegionMeta(parseRegionMeta(regionRawMeta())));

  const [client, destroyClient] = initializeClient(p.interval, (result) =>
    onReply(result, {
      setPlayState,
      setRepeat,
      setRecording,
      setCurrentTime,
      setRegions,
      setMarkers,
      setTracks: (tracks) => {
        setTracks(reconcile(tracks));
      },
      setSends: (sends) => {
        setSends(reconcile(sends));
      },
      setRawRegionMeta,
    }),
  );
  onCleanup(destroyClient);

  for (const sub of p.subscriptions) {
    client.subscribe(sub.request, sub.interval);
  }

  const context: Reaper = {
    data: {
      currentTime,
      playState,
      recording,
      repeat,
      regions,
      regionMeta,
      regionMarkers,
      tracks,
      sends,
    },
    actions: {
      subscribe: client.subscribe,
      play() {
        client.run({ type: "Play" }, false);
      },
      pause() {
        if (playState() === PlayState.Playing) {
          client.run({ type: "Pause" }, false);
        }
      },
      stop() {
        client.run({ type: "Stop" }, false);
      },
      record() {
        client.run({ type: "Record" }, false);
      },
      moveToRegion(region) {
        client.run(
          { type: "Move", pos: region.startTime, end: region.endTime },
          false,
        );
      },
      moveToMarker(marker) {
        if (marker == null) return;
        client.run({ type: "Move", pos: marker.startTime }, false);
      },
      setOutputVolume(id, volume) {
        client.run({ type: "SetTrackVolume", track: id, volume }, true);
        setTracks(
          (track) => track.id === id,
          produce((state) => {
            state.volume = volume;
          }),
        );
      },
      setSendVolume(send, volume) {
        client.run(
          {
            type: "SetSendVolume",
            track: send.trackTo,
            send: send.index,
            volume,
          },
          true,
        );
        setSends(
          (s) =>
            s.index === send.index &&
            s.trackFrom === send.trackFrom &&
            s.trackTo === send.trackTo,
          produce((state) => {
            state.volume = volume;
          }),
        );
      },
      toggleSendMute(send) {
        client.run(
          {
            type: "ToggleSendMute",
            track: send.trackTo,
            send: send.index,
          },
          true,
        );
        setSends(
          (s) =>
            s.index === send.index &&
            s.trackFrom === send.trackFrom &&
            s.trackTo === send.trackTo,
          produce((state) => {
            state.mute = !state.mute;
          }),
        );
      },
      toggleRepeat() {
        client.run({ type: "ToggleRepeat" }, false);
      },
      updateRegionMeta(update) {
        const newState = setRegionMeta(update);
        client.run(
          {
            type: "SetRegionsMeta",
            value: serializeRegionMeta(newState),
          },
          true,
        );
      },
    },
  };

  return (
    <ReaperContext.Provider value={context}>
      {p.children}
    </ReaperContext.Provider>
  );
}

export function useReaper() {
  return useContext(ReaperContext);
}
