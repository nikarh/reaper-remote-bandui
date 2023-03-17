import { createSignal, For } from "solid-js";
import { OutputSelector, OutputTrack } from "./OutputSelector";
import { Track, TrackControl } from "./TrackControl";

const outputTracks: OutputTrack[] = [
  { id: 41, name: "Guitar" },
  { id: 42, name: "Bass" },
  { id: 43, name: "Vocals" },
];

let mixTracks: Track[] = [
  {
    id: 12,
    name: "Guitar",
    volume: -20,
    mute: false,
    level: 0,
    color: "red",
  },
  {
    id: 13,
    name: "Bass",
    volume: -8,
    mute: false,
    level: -2,
    color: "red",
  },
  {
    id: 14,
    name: "Vocals",
    volume: -2,
    mute: false,
    level: -10,
    color: "red",
  },
];

function updateTrack(
  tracks: Track[],
  id: number,
  update: Partial<Track>
): Track[] {
  return tracks.map((t) => (t.id == id ? { ...t, ...update } : t));
}

export function Mix() {
  const [tracks, setTracks] = createSignal(mixTracks);
  const [output, setOutput] = createSignal(outputTracks[0].id);

  return (
    <div class="mt-2 flex flex-col items-center">
      <div class="p-4">
        <OutputSelector
          tracks={outputTracks}
          selected={output()}
          onSelected={setOutput}
        />
      </div>
      <For each={tracks()}>
        {(track) => (
          <TrackControl
            track={track}
            onMuteToggle={() => {
              setTracks(
                updateTrack(tracks(), track.id, { mute: !track.mute })
              );
            }}
            onVolumeChange={(volume) =>
              setTracks(updateTrack(tracks(), track.id, { volume }))
            }
          />
        )}
      </For>
    </div>
  );
}
