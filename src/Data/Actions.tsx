interface PlayAction {
  type: "Play";
}
interface PauseAction {
  type: "Pause";
}
interface StopAction {
  type: "Stop";
}

interface MoveAction {
  type: "Move";
  pos: number;
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

export type Action =
  | PlayAction
  | PauseAction
  | StopAction
  | MoveAction
  | SetTrackVolumeAction
  | SetSendVolumeAction
  | ToggleSendMuteAction;

export function reduceActions(actions: Action[]): Action[] {
  let control: (PlayAction | PauseAction | StopAction)[] = [];
  let move: MoveAction[] = [];
  let trackVolume: { [k in number]: SetTrackVolumeAction } = {};
  let sendVolume: { [k in number]: { [k in string]: SetSendVolumeAction } } =
    {};
  let sendMutes: { [k in number]: { [k in string]: boolean } } = {};

  for (let action of actions) {
    switch (action.type) {
      case "Play":
      case "Pause":
      case "Stop":
        control = [action];
        break;
      case "Move":
        move = [action];
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
    }
  }

  return [
    ...control,
    ...move,
    ...Object.values(trackVolume),
    ...Object.values(sendVolume).flatMap((s) => Object.values(s)),
    ...Object.entries(sendMutes).flatMap(([track, sends]) =>
      Object.entries(sends)
        .filter(([_, m]) => m)
        .map(
          ([send]) =>
            ({
              type: "ToggleSendMute",
              track: parseInt(track),
              send,
            }) as ToggleSendMuteAction,
        ),
    ),
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
        case "Move":
          return `SET/POS/${action.pos};TRANSPORT`;
        case "SetTrackVolume":
          return `SET/TRACK/${action.track}/VOL/${action.volume}`;
        case "SetSendVolume":
          return `SET/TRACK/${action.track}/SEND/${action.send}/VOL/${action.volume}`;
        case "ToggleSendMute":
          return `SET/TRACK/${action.track}/SEND/${action.send}/MUTE/-1`;
      }
    })
    .join(";");
}
