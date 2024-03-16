export enum PlayState {
  Playing = 0,
  Paused = 1,
  Stopped = 2,
}

export interface Track {
  id: number;
  name: string;
  volume: number;
  color: string;
  peakVolume: number;
  receiveCount: number;
  isOutput: boolean;
}

export interface Send {
  index: string;
  trackTo: number;
  trackFrom: number;
  volume: number;
  mute: boolean;
}

export interface Region {
  id: number;
  name: string;
  startTime: number;
  endTime: number;
  color?: string;
}

export interface RegionMeta {
  id: number;
  index: number;
  disabled: boolean;
}

export type ParsedMeta = { [k: number]: RegionMeta };

export interface CurrentTime {
  seconds: number;
  beats: string;
}
