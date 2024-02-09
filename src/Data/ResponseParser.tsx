import { Region, PlayState, Track, Send, CurrentTime } from "./State";

interface Setters {
  setPlayState(state: PlayState): void;
  setRecording(recording: boolean): void;
  setRepeat(repeat: boolean): void;
  setCurrentTime(time: CurrentTime): void;
  setRegions(regions: Region[]): void;
  setTracks(tracks: Track[]): void;
  setSends(sends: Send[]): void;
}

function colorToRgba(color: string): string {
  let parsed = (parseInt(color) | 0x1000000).toString(16);
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
    setTracks,
    setSends,
  }: Setters,
) {
  let regionStrings: string[][] = [];

  let tracks: Track[] = [];
  let hasTracks = false;

  let sends: Send[] = [];
  let hasSends = false;

  const lines = result.split("\n");
  for (let line of lines) {
    var tokens = line.split("\t");
    if (tokens.length == 0) {
      continue;
    }

    switch (tokens[0]) {
      case "TRANSPORT": {
        if (tokens.length < 5) {
          continue;
        }

        setCurrentTime({
          seconds: parseFloat(tokens[2]),
          beats: tokens[4],
        });

        const state = parseInt(tokens[1]);
        setPlayState(
          ((state) => {
            if (state & 1) return PlayState.Playing;
            if (state & 2) return PlayState.Paused;
            return PlayState.Stopped;
          })(state),
        );

        setRecording((state & 4) != 0);
        setRepeat(tokens[3] == "1");

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
            id: parseInt(id),
            startTime: parseFloat(startTime),
            endTime: parseFloat(endTime),
            color: colorToRgba(color),
          }),
        );

        setRegions(newRegions);
        break;
      }
      case "TRACK": {
        hasTracks = true;
        let [
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
          id: parseInt(id),
          name,
          volume: parseFloat(volume),
          peakVolume: parseFloat(last_meter_peak),
          color: colorToRgba(color),
          receiveCount: parseInt(receiveCount),
          isOutput: hwOutCount != "0" && receiveCount != "0",
        });

        break;
      }
      case "SEND": {
        hasSends = true;
        let [_, trackTo, index, flags, volume, _pan, trackFrom] = tokens;

        sends.push({
          index,
          trackFrom: parseInt(trackFrom),
          trackTo: parseInt(trackTo),
          volume: parseFloat(volume),
          mute: (parseInt(flags) & 8) != 0,
        });
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
