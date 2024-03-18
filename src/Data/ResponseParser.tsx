import {
  type CurrentTime,
  type Marker,
  PlayState,
  type Region,
  type Send,
  type Track,
} from "./State";

interface Setters {
  setPlayState(state: PlayState): void;
  setRecording(recording: boolean): void;
  setRepeat(repeat: boolean): void;
  setCurrentTime(time: CurrentTime): void;
  setRegions(regions: Region[]): void;
  setMarkers(markers: Marker[]): void;
  setTracks(tracks: Track[]): void;
  setSends(sends: Send[]): void;
  setRawRegionMeta(meta: string): void;
}

function colorToRgba(color: string): string {
  const parsed = (Number.parseInt(color) | 0x1000000).toString(16);
  return `#${parsed.substring(parsed.length - 6)}`;
}

export function onReply(
  result: string,
  {
    setPlayState,
    setRecording,
    setRepeat,
    setCurrentTime,
    setRegions,
    setMarkers,
    setTracks,
    setSends,
    setRawRegionMeta,
  }: Setters,
) {
  let regionStrings: string[][] = [];
  let markerStrings: string[][] = [];

  const tracks: Track[] = [];
  let hasTracks = false;

  const sends: Send[] = [];
  let hasSends = false;

  const lines = result.split("\n");
  for (const line of lines) {
    const tokens = line.split("\t");
    if (tokens.length === 0) {
      continue;
    }

    switch (tokens[0]) {
      case "TRANSPORT": {
        if (tokens.length < 5) {
          continue;
        }

        setCurrentTime({
          seconds: Number.parseFloat(tokens[2]),
          beats: tokens[4],
        });

        const state = Number.parseInt(tokens[1]);
        setPlayState(
          ((state) => {
            if (state & 1) return PlayState.Playing;
            if (state & 2) return PlayState.Paused;
            return PlayState.Stopped;
          })(state),
        );

        setRecording((state & 4) !== 0);
        setRepeat(tokens[3] === "1");

        break;
      }
      case "REGION_LIST": {
        regionStrings = [];
        break;
      }
      case "REGION": {
        regionStrings.push(tokens);
        break;
      }
      case "REGION_LIST_END": {
        const newRegions = regionStrings.map(
          ([_cmd, name, id, startTime, endTime, color]) => ({
            name,
            id: Number.parseInt(id),
            startTime: Number.parseFloat(
              Number.parseFloat(startTime).toFixed(10),
            ),
            endTime: Number.parseFloat(Number.parseFloat(endTime).toFixed(10)),
            color: color === "0" ? undefined : colorToRgba(color),
          }),
        );

        setRegions(newRegions);
        break;
      }
      case "MARKER_LIST": {
        markerStrings = [];
        break;
      }
      case "MARKER": {
        markerStrings.push(tokens);
        break;
      }
      case "MARKER_LIST_END": {
        const newMarkers = markerStrings.map(
          ([_cmd, name, id, startTime, color]) => ({
            name,
            id: Number.parseInt(id),
            startTime: Number.parseFloat(
              Number.parseFloat(startTime).toFixed(10),
            ),
            color: color === "0" ? undefined : colorToRgba(color),
          }),
        );

        setMarkers(newMarkers);
        break;
      }
      case "TRACK": {
        hasTracks = true;
        const [
          _,
          id,
          name,
          _flags,
          volume,
          _pan,
          last_meter_peak,
          _last_meter_pos,
          _width,
          _panmode,
          _sendCount,
          receiveCount,
          hwOutCount,
          color,
        ] = tokens;

        tracks.push({
          id: Number.parseInt(id),
          name,
          volume: Number.parseFloat(volume),
          peakVolume: Number.parseFloat(last_meter_peak),
          color: colorToRgba(color),
          receiveCount: Number.parseInt(receiveCount),
          isOutput: hwOutCount !== "0" && receiveCount !== "0",
        });

        break;
      }
      case "SEND": {
        hasSends = true;
        const [_, trackTo, index, flags, volume, _pan, trackFrom] = tokens;

        sends.push({
          index,
          trackFrom: Number.parseInt(trackFrom),
          trackTo: Number.parseInt(trackTo),
          volume: Number.parseFloat(volume),
          mute: (Number.parseInt(flags) & 8) !== 0,
        });
        break;
      }
      case "PROJEXTSTATE": {
        if (tokens[1] === "BANDUI" && tokens[2] === "regions") {
          setRawRegionMeta(tokens[3]);
        }
        break;
      }
    }
  }

  if (hasTracks) {
    setTracks(tracks);
  }

  if (hasSends) {
    setSends(sends);
  }
}
