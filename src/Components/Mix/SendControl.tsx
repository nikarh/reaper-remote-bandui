import { gainToDb } from "../../Data/FaderLaw";
import type { Send, Track } from "../../Data/State";
import { Fader } from "../UI/Fader";

/** REAPER reports meter peaks in dB * 10, -1500 for silence. */
function peakDb(peak: number): number {
  return peak <= -1500 ? Number.NEGATIVE_INFINITY : peak / 10;
}

interface SendControlProps {
  send: Send;
  track: Track;
  onMuteToggle: () => void;
  onVolumeChange: (volume: number) => void;
}

export function SendControl(p: SendControlProps) {
  return (
    <div class="my-3 flex rounded-lg border-gray-700 bg-gray-800 p-2 shadow-sm">
      <Fader
        label={
          <>
            {p.track.name} <span class="text-gray-400">({p.track.id})</span>
          </>
        }
        gain={p.send.volume}
        onChange={p.onVolumeChange}
        meterDb={
          p.send.mute
            ? Number.NEGATIVE_INFINITY
            : peakDb(p.track.peakVolume) + gainToDb(p.send.volume)
        }
        color={p.track.color}
      />
      <button
        type="button"
        class={`${
          p.send.mute ? "btn-mute-red" : "btn-mute"
        } ml-5 px-7 py-2 text-xs`}
        onClick={p.onMuteToggle}
      >
        M
      </button>
    </div>
  );
}

interface OutputControlProps {
  track: Track;
  onVolumeChange: (volume: number) => void;
}

export function OutputControl(p: OutputControlProps) {
  return (
    <div class="mb-3 rounded-lg border border-gray-700 bg-gray-700 p-2 shadow-sm">
      <div class="mb-1 flex font-normal text-gray-400">
        <div class="flex-1">
          <b>Output:</b> {p.track.name}{" "}
          <span class="text-gray-500">({p.track.id})</span>
        </div>
        <div class="font-small text-gray-500">
          Peak: {(p.track.peakVolume / 10).toFixed(2)} dB
        </div>
      </div>

      <Fader
        gain={p.track.volume}
        onChange={p.onVolumeChange}
        meterDb={peakDb(p.track.peakVolume)}
        color={p.track.color}
      />
    </div>
  );
}
