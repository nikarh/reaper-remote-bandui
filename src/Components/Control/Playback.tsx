import { useReaper } from "../../Data/Context";
import {
  textColor,
  useCurrentMarker,
  useCurrentRegion,
  useNextMarker,
  usePreviousMarker,
} from "../../Data/Selectors";
import { type Marker, PlayState, type Region } from "../../Data/State";
import { Icons } from "../UI/Icons";

function CurrentRegion(p: { region?: Region }) {
  return (
    <>
      {p.region != null && (
        <span
          class={`px-1 my-0.5 rounded-md ${textColor(p.region.color)}`}
          style={{ background: p.region.color }}
        >
          {p.region.name}
        </span>
      )}
      {p.region == null && "-"}
    </>
  );
}

function CurrentMarker(p: { marker?: Marker }) {
  return (
    <>
      {p.marker != null && (
        <span class="text-gray-400">
          <span
            class={`bg-red-600 px-1 rounded-md ${textColor(p.marker.color)}`}
            style={{ background: p.marker.color }}
          >
            {p.marker.id}
          </span>
          {p.marker.name && ` ${p.marker.name}`}
        </span>
      )}
      {p.marker == null && "-"}
    </>
  );
}

function Progress() {
  const region = useCurrentRegion();
  const marker = useCurrentMarker();

  return (
    <div class="flex flex-col flex-grow content-center justify-center text-center bg-gray-800 brightness-110">
      <div class="text-sm">
        <CurrentRegion region={region()} />
      </div>
      <div class="text-[10px]">
        <CurrentMarker marker={marker()} />
      </div>
    </div>
  );
}

export function MainControl() {
  const {
    data: { playState: state, recording, repeat },
    actions: { play, pause, stop, record, toggleRepeat, moveToMarker },
  } = useReaper();

  const previousMarker = usePreviousMarker();
  const nextMarker = useNextMarker();

  return (
    <div class="flex flex-col justify-center space-y-4">
      <div class="flex justify-center space-x-4">
        <button
          type="button"
          onClick={record}
          class={`btn-primary btn-primary-red w-14 rounded-md ${
            recording() && "selected"
          }`}
        >
          <Icons.Record />
        </button>
        <div class="flex grow justify-center rounded-md" role="group">
          <button
            type="button"
            onClick={play}
            class={`btn-primary w-14 rounded-l ${
              state() === PlayState.Playing && "selected"
            }`}
          >
            <Icons.Play />
          </button>
          <button
            type="button"
            onClick={pause}
            class={`btn-primary w-14 ${
              state() === PlayState.Paused && "selected"
            }`}
          >
            <Icons.Pause />
          </button>
          <button
            type="button"
            onClick={stop}
            class={`btn-primary w-14 rounded-r ${
              state() === PlayState.Stopped && "selected"
            }`}
          >
            <Icons.Stop />
          </button>
        </div>

        <button
          type="button"
          onClick={toggleRepeat}
          class={`btn-primary w-14 rounded-md ${repeat() && "selected"}`}
        >
          <Icons.Repeat />
        </button>
      </div>
      <div
        class="flex justify-center rounded-md shadow-sm h-10 mb-4"
        role="group"
      >
        <button
          class="flex items-center btn-primary rounded-none rounded-l"
          type="button"
          disabled={previousMarker() == null}
          onclick={() => moveToMarker(previousMarker())}
        >
          <Icons.Left />
        </button>
        <Progress />
        <button
          class="flex items-center btn-primary rounded-none rounded-r"
          type="button"
          disabled={nextMarker() == null}
          onclick={() => moveToMarker(nextMarker())}
        >
          <Icons.Right />
        </button>
      </div>
    </div>
  );
}
