import deepEqual from "deep-equal";
import {
  Accessor,
  createContext,
  createSignal,
  JSX,
  onCleanup,
  useContext,
} from "solid-js";
import { createStore, produce, reconcile, Store } from "solid-js/store";

import { initializeClient } from "./ClientLoop";
import { onReply } from "./ResponseParser";
import { CurrentTime, PlayState, Region, Send, Track } from "./State";

interface Reaper {
  data: {
    currentTime: Accessor<CurrentTime>;
    playState: Accessor<PlayState>;
    recording: Accessor<boolean>;
    repeat: Accessor<boolean>;
    regions: Accessor<Region[]>;
    tracks: Store<Track[]>;
    sends: Store<Send[]>;
  };
  actions: {
    subscribe(request: string, interval: number): () => void;
    moveToRegion(region: Region): void;
    toggleSendMute(send: Send): void;
    toggleRepeat(): void;
    setSendVolume(send: Send, volume: number): void;
    setOutputVolume(id: number, volume: number): void;
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
    tracks: [],
    sends: [],
  },
  actions: {
    subscribe: () => () => {},
    moveToRegion: () => {},
    toggleSendMute: () => {},
    toggleRepeat: () => {},
    setSendVolume: () => {},
    setOutputVolume: () => {},
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

export function ReaperProvider(p: ReaperProps) {
  const [currentTime, setCurrentTime] = createSignal({
    seconds: 0,
    beats: "0.0.0",
  });
  const [playState, setPlayState] = createSignal(PlayState.Stopped);
  const [repeat, setRepeat] = createSignal(false);
  const [recording, setRecording] = createSignal(false);
  const [regions, setRegions] = createSignal<Region[]>([], {
    equals: deepEqual,
  });
  const [tracks, setTracks] = createStore<Track[]>([]);
  const [sends, setSends] = createStore<Send[]>([]);

  let [client, destroyClient] = initializeClient(p.interval, (result) =>
    onReply(result, {
      setPlayState,
      setRepeat,
      setRecording,
      setCurrentTime,
      setRegions,
      setTracks: (tracks) => {
        setTracks(reconcile(tracks));
      },
      setSends: (sends) => {
        setSends(reconcile(sends));
      },
    }),
  );
  onCleanup(destroyClient);

  for (let sub of p.subscriptions) {
    client.subscribe(sub.request, sub.interval);
  }

  const context: Reaper = {
    data: {
      currentTime,
      playState,
      recording,
      repeat,
      regions,
      tracks,
      sends,
    },
    actions: {
      subscribe: client.subscribe,
      play() {
        client.run({ type: "Play" }, false);
      },
      pause() {
        if (playState() == PlayState.Playing) {
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
            s.trackFrom == s.trackFrom &&
            s.trackTo == s.trackTo,
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
            s.trackFrom == s.trackFrom &&
            s.trackTo == s.trackTo,
          produce((state) => {
            state.mute = !state.mute;
          }),
        );
      },
      toggleRepeat() {
        client.run({ type: "ToggleRepeat" }, false);
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
