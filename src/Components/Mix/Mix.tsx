import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  observable,
  onCleanup,
} from "solid-js";
import { unwrap } from "solid-js/store";
import { useReaper } from "../../Data/Context";
import { Skeleton } from "../UI/Skeleton";
import { OutputSelector } from "./OutputSelector";
import { OutputControl, SendControl } from "./SendControl";

function NoOutputsFound() {
  return (
    <div class="flex justify-center grow">
      <div class="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-4 text-left font-medium text-gray-400 mt-2">
        No output tracks
      </div>
    </div>
  );
}

export function Mix() {
  const [output, setOutput] = createSignal<number>(0);
  const {
    data: { tracks, sends },
    actions: { toggleSendMute, setSendVolume, setOutputVolume, subscribe },
  } = useReaper();

  const outputTracks = createMemo(() => {
    const _bindingHack = Object.keys(tracks)[0];
    const result = unwrap(tracks)
      .map((t, index) => [index, t.isOutput] as [number, boolean])
      .filter(([_, isOutput]) => isOutput)
      .map(([index]) => tracks[index]);
    return result;
  });

  const outputTrack = () => {
    const _bindingHack = Object.keys(tracks)[0];
    return outputTracks()[output()];
  };

  const trackSends = () => {
    const _bindingHack = Object.keys(sends)[0];
    return sends.filter((s) => s.trackTo === outputTrack().id);
  };

  createEffect(() => {
    const track = outputTracks()[output()];
    if (track == null) {
      return;
    }

    const command = [...Array(track.receiveCount)]
      .map((_, i) => `GET/TRACK/${track.id}/SEND/-${i + 1}`)
      .join(";");

    onCleanup(subscribe(command, 500));
  });

  return (
    <Show when={outputTracks().length > 0} fallback={<NoOutputsFound />}>
      <Skeleton
        navigation={
          <OutputSelector
            tracks={outputTracks()}
            selected={output()}
            onSelected={setOutput}
          />
        }
      >
        <OutputControl
          track={outputTrack()}
          onVolumeChange={(volume) => {
            setOutputVolume(outputTrack().id, volume);
          }}
        />
        <For each={trackSends()}>
          {(send) => (
            <SendControl
              send={send}
              track={tracks[send.trackFrom]}
              onMuteToggle={() => {
                toggleSendMute(send);
              }}
              onVolumeChange={(volume) => {
                setSendVolume(send, volume);
              }}
            />
          )}
        </For>
      </Skeleton>
    </Show>
  );
}
