interface PlayAction {
  type: "Play";
}
interface PauseAction {
  type: "Pause";
}
interface StopAction {
  type: "Stop";
}
interface RecordAction {
  type: "Record";
}

interface MoveAction {
  type: "Move";
  pos?: number;
  start: number;
  end: number;
}

interface SetTrackVolumeAction {
  type: "SetTrackVolume";
  track: number;
  volume: number;
}

interface SetSendVolumeAction {
  type: "SetSendVolume";
  track: number;
  send: string;
  volume: number;
}

interface ToggleSendMuteAction {
  type: "ToggleSendMute";
  track: number;
  send: string;
}

interface ToggleRepeatAction {
  type: "ToggleRepeat";
}

interface SetRegionsMeta {
  type: "SetRegionsMeta";
  value: string;
}

interface PreviousMarker {
  type: "PreviousMarker";
}

interface NextMarker {
  type: "NextMarker";
}

export type Action =
  | PlayAction
  | PauseAction
  | StopAction
  | RecordAction
  | MoveAction
  | SetTrackVolumeAction
  | SetSendVolumeAction
  | ToggleSendMuteAction
  | ToggleRepeatAction
  | SetRegionsMeta
  | PreviousMarker
  | NextMarker;

export function reduceActions(actions: Action[]): Action[] {
  const latest: { [k: string]: Action } = {};
  const trackVolume: { [k in number]: SetTrackVolumeAction } = {};
  const sendVolume: { [k in number]: { [k in string]: SetSendVolumeAction } } =
    {};
  const sendMutes: { [k in number]: { [k in string]: boolean } } = {};
  const others: Action[] = [];

  for (const action of actions) {
    switch (action.type) {
      case "Play":
      case "Pause":
      case "Stop":
      case "Record":
        latest.control = action;
        break;
      case "Move":
      case "ToggleRepeat":
      case "SetRegionsMeta":
        latest[action.type] = action;
        break;
      case "SetTrackVolume":
        trackVolume[action.track] = action;
        break;
      case "SetSendVolume":
        sendVolume[action.track] = {
          [action.send]: action,
          ...(sendVolume[action.track] ?? {}),
        };
        break;
      case "ToggleSendMute":
        sendMutes[action.track] = {
          [action.send]: !(sendVolume[action.track] ?? false),
        };
        break;
      default:
        others.push(action);
        break;
    }
  }

  return [
    ...Object.values(latest),
    ...Object.values(trackVolume),
    ...Object.values(sendVolume).flatMap((s) => Object.values(s)),
    ...Object.entries(sendMutes).flatMap(([track, sends]) =>
      Object.entries(sends)
        .filter(([_, m]) => m)
        .map(
          ([send]) =>
            ({
              type: "ToggleSendMute",
              track: Number.parseInt(track),
              send,
            }) as ToggleSendMuteAction,
        ),
    ),
    ...others,
  ];
}

export function actionsToCommands(actions: Action[]): string {
  return actions
    .map((action) => {
      switch (action.type) {
        case "Play":
          return "1007;TRANSPORT";
        case "Pause":
          return "1008;TRANSPORT";
        case "Stop":
          return "40667;TRANSPORT";
        case "Record":
          return "1013;TRANSPORT";
        case "ToggleRepeat":
          return "1068;TRANSPORT";
        case "PreviousMarker":
          return "40172;TRANSPORT";
        case "NextMarker":
          return "40173;TRANSPORT";
        case "Move":
          return action.pos == null
            ? `SET/POS/${action.end};40626;SET/POS/${action.start};40625;TRANSPORT`
            : `SET/POS/${action.end};40626;SET/POS/${action.start};40625;SET/POS/${action.pos};TRANSPORT`;
        case "SetTrackVolume":
          return `SET/TRACK/${action.track}/VOL/${action.volume}`;
        case "SetSendVolume":
          return `SET/TRACK/${action.track}/SEND/${action.send}/VOL/${action.volume}`;
        case "ToggleSendMute":
          return `SET/TRACK/${action.track}/SEND/${action.send}/MUTE/-1`;
        case "SetRegionsMeta":
          return `SET/PROJEXTSTATE/BANDUI/regions/${action.value}`;
      }
    })
    .join(";");
}
