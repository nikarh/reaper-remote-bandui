import { useReaper } from "../../Data/Context";
import { PlayState } from "../../Data/State";
import { Icons } from "../UI/Icons";

export function MainControl() {
  const {
    data: { playState: state, recording, repeat },
    actions: { play, pause, stop, record, toggleRepeat },
  } = useReaper();

  return (
    <div class="flex justify-center space-x-4">
      <div class="flex justify-center rounded-md shadow-sm" role="group">
        <button
          type="button"
          onClick={play}
          class={`btn-primary rounded-l w-14 ${
            state() == PlayState.Playing && "selected"
          }`}
        >
          <Icons.Play />
        </button>
        <button
          type="button"
          onClick={pause}
          class={`btn-primary w-14 ${state() == PlayState.Paused && "selected"}`}
        >
          <Icons.Pause />
        </button>
        <button
          type="button"
          onClick={stop}
          class={`btn-primary w-14 rounded-r ${
            state() == PlayState.Stopped && "selected"
          }`}
        >
          <Icons.Stop />
        </button>
      </div>

      <div class="flex justify-center rounded-md shadow-sm" role="group">
        <button
          type="button"
          onClick={record}
          class={`btn-primary btn-primary-red w-14 rounded-l ${recording() && "selected"}`}
        >
          <Icons.Record />
        </button>

        <button
          type="button"
          onClick={toggleRepeat}
          class={`btn-primary w-14 rounded-r ${repeat() && "selected"}`}
        >
          <Icons.Repeat />
        </button>
      </div>
    </div>
  );
}
