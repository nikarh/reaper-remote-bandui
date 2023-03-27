import {
  createEffect,
  createMemo,
  createSignal,
  For,
  observable,
  onCleanup,
  Show,
} from "solid-js";
import { unwrap } from "solid-js/store";
import { useReaper } from "../../Data/Context";
import { Skeleton } from "../UI/Skeleton";
import { OutputSelector } from "./OutputSelector";
import { OutputControl, SendControl } from "./SendControl";

function NoOutputsFound() {
  return (
    <div class="max-w-md w-full p-4 font-medium text-left text-gray-500 border border-gray-200 rounded-xl dark:border-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
      No output tracks
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
    return unwrap(tracks)
      .map((t, index) => [index, t.isOutput] as [number, boolean])
      .filter(([_, isOutput]) => isOutput)
      .map(([index]) => tracks[index]);
  });

  const outputTrack = () => {
    return outputTracks()[output()];
  };

  createEffect(() => {
    const track = outputTracks()[output()];
    let command = [...Array(track.receiveCount)]
      .map((_, i) => `GET/TRACK/${track.id}/SEND/-${i + 1}`)
      .join(";");
    onCleanup(subscribe(command, 200));
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
        <For each={sends}>
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
