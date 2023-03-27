import { useReaper } from "../../Data/Context";
import { PlayState } from "../../Data/State";
import { Icons } from "../UI/Icons";

export function MainControl() {
  const {
    data: { playState: state },
    actions: { play, pause, stop },
  } = useReaper();
  return (
    <div class="flex justify-center rounded-md shadow-sm" role="group">
      <button
        type="button"
        onClick={play}
        class={`btn-primary rounded-l w-16 ${
          state() == PlayState.Playing && "selected"
        }`}
      >
        {Icons.Play}
      </button>
      <button
        type="button"
        onClick={pause}
        class={`btn-primary w-16 ${state() == PlayState.Paused && "selected"}`}
      >
        {Icons.Pause}
      </button>
      <button
        type="button"
        onClick={stop}
        class={`btn-primary w-16 rounded-r ${
          state() == PlayState.Stopped && "selected"
        }`}
      >
        {Icons.Stop}
      </button>
    </div>
  );
}
