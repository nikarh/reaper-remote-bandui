// A fake REAPER web interface for development and the end-to-end tests: `npm run dev:mock`.
//
// It answers the subset of REAPER's `/_/` protocol the UI uses, with a project shaped like `Mother Project.RPP` (more
// songs, so the list scrolls). Playback advances in real time and stops at the end of the time selection unless repeat
// is on, as REAPER does with "Stop playback at end of loop if repeat is disabled".
//
// `GET /_mock/state` returns the state as JSON and `POST /_mock/reset` restores it, for the tests.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

interface Receive {
  from: number;
  volume: number;
  mute: boolean;
}

interface Track {
  name: string;
  color: number;
  volume: number;
  hwOut: boolean;
  receives: Receive[];
}

interface Region {
  id: number;
  name: string;
  start: number;
  end: number;
  color: number;
}

interface Marker {
  id: number;
  name: string;
  position: number;
  color: number;
}

interface State {
  playState: number;
  position: number;
  editCursor: number;
  playedAt: number;
  repeat: boolean;
  selection: [number, number];
  tracks: Track[];
  regions: Region[];
  markers: Marker[];
  extState: Record<string, string>;
  commands: string[];
}

const rgb = (r: number, g: number, b: number) =>
  0x1000000 | (r << 16) | (g << 8) | b;

const SONGS = [
  "Summer",
  "Autumn",
  "Winter",
  "Spring",
  "Morning",
  "Noon",
  "Evening",
  "Night",
  "Rain",
  "Snow",
  "Wind",
  "Thunder",
  "Fog",
  "Frost",
  "Dawn",
  "Dusk",
  "Storm",
  "Calm",
];

function initialState(): State {
  const plain = (name: string, color = 0): Track => ({
    name,
    color,
    volume: 1,
    hwOut: false,
    receives: [],
  });
  const output = (
    name: string,
    color: number,
    receives: [number, number][],
  ): Track => ({
    name,
    color,
    volume: 1,
    hwOut: true,
    receives: receives.map(([from, volume]) => ({
      from,
      volume,
      mute: false,
    })),
  });

  // Track ids are 1-based as in the web interface; 0 is the master track.
  const tracks: Track[] = [
    plain("MASTER"),
    plain("MIDI"),
    plain("Click", rgb(255, 200, 0)),
    plain("Audio"),
    plain("Backtrack", rgb(80, 160, 255)),
    plain("Vocal Backtrack", rgb(80, 120, 220)),
    plain("Inputs"),
    plain("Drum mic [1]", rgb(220, 70, 70)),
    plain("Bass [3]", rgb(70, 200, 120)),
    plain("Guitar [4]", rgb(230, 130, 40)),
    plain("Vocals [5]", rgb(180, 90, 220)),
    plain("Outputs"),
    output("PA [1+2]", rgb(120, 120, 120), [
      [4, 1],
      [5, 1],
    ]),
    output("Drums [3+4]", rgb(220, 70, 70), [
      [2, 0.99],
      [4, 0.89],
      [5, 0.77],
      [7, 0.36],
      [8, 0.82],
      [9, 0.72],
      [10, 0.83],
    ]),
    output("Bass [5+6]", rgb(70, 200, 120), [
      [2, 1],
      [4, 1],
      [5, 1],
      [7, 1],
      [8, 1.41],
      [9, 0.5],
      [10, 0.5],
    ]),
  ];

  const regions: Region[] = [];
  const markers: Marker[] = [];
  let t = 0;
  SONGS.forEach((name, i) => {
    const length = 150 + ((i * 37) % 120);
    regions.push({
      id: i + 1,
      name,
      start: t,
      end: t + length,
      color: i % 3 === 0 ? 0 : rgb(40 + i * 15, 90, 160 - i * 8),
    });
    for (const [part, at] of [
      ["Intro", 0],
      ["Verse", 0.2],
      ["Chorus", 0.5],
    ] as const) {
      markers.push({
        id: markers.length + 1,
        name: part,
        position: t + length * at,
        color: part === "Chorus" ? rgb(200, 40, 40) : 0,
      });
    }
    t += length + 20;
  });

  return {
    playState: 0,
    position: 0,
    editCursor: 0,
    playedAt: 0,
    repeat: false,
    selection: [0, 0],
    tracks,
    regions,
    markers,
    extState: {},
    commands: [],
  };
}

let state = initialState();

function playing() {
  return (state.playState & 1) !== 0;
}

/** Moves the play position forward to now. */
function advance() {
  if (!playing()) {
    return;
  }
  const now = Date.now();
  state.position += (now - state.playedAt) / 1000;
  state.playedAt = now;

  const [start, end] = state.selection;
  if (end > start && state.position >= end) {
    if (state.repeat) {
      state.position = start + ((state.position - start) % (end - start));
    } else {
      state.playState = 0;
      state.position = state.editCursor;
    }
  }
}

function setPosition(position: number) {
  state.position = Math.max(0, position);
  state.editCursor = state.position;
  state.playedAt = Date.now();
}

function boundaries(): number[] {
  return [
    ...state.regions.flatMap((r) => [r.start, r.end]),
    ...state.markers.map((m) => m.position),
  ].sort((a, b) => a - b);
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3).padStart(6, "0");
  return `${m}:${s}`;
}

function formatBeats(seconds: number) {
  // 120 BPM, 4/4.
  const beats = seconds * 2;
  const measure = Math.floor(beats / 4) + 1;
  const beat = Math.floor(beats % 4) + 1;
  const fraction = Math.floor((beats % 1) * 100)
    .toString()
    .padStart(2, "0");
  return `${measure}.${beat}.${fraction}`;
}

/** A plausible meter reading in dB * 10, as REAPER reports it. */
function peak(id: number) {
  if (!playing()) {
    return -1500;
  }
  const wobble = Math.sin(Date.now() / (150 + id * 13) + id) * 60;
  return Math.round(-180 + wobble);
}

function transportLine() {
  return [
    "TRANSPORT",
    state.playState,
    state.position.toFixed(6),
    state.repeat ? 1 : 0,
    formatTime(state.position),
    formatBeats(state.position),
  ].join("\t");
}

function trackLine(id: number) {
  const t = state.tracks[id];
  const sends = state.tracks.filter((o) =>
    o.receives.some((r) => r.from === id),
  ).length;
  return [
    "TRACK",
    id,
    t.name,
    0,
    t.volume.toFixed(6),
    "0.000000",
    peak(id),
    peak(id) - 30,
    "1.000000",
    -1,
    sends,
    t.receives.length,
    t.hwOut ? 1 : 0,
    t.color,
  ].join("\t");
}

/** One command; returns the lines it answers with. */
function run(command: string): string[] {
  const parts = command.split("/");

  switch (parts[0]) {
    case "TRANSPORT":
      return [transportLine()];
    case "TRACK":
      return [
        `NTRACK\t${state.tracks.length - 1}`,
        ...state.tracks.map((_, id) => trackLine(id)),
      ];
    case "REGION":
      return [
        "REGION_LIST",
        ...state.regions.map((r) =>
          ["REGION", r.name, r.id, r.start, r.end, r.color].join("\t"),
        ),
        "REGION_LIST_END",
      ];
    case "MARKER":
      return [
        "MARKER_LIST",
        ...state.markers.map((m) =>
          ["MARKER", m.name, m.id, m.position, m.color].join("\t"),
        ),
        "MARKER_LIST_END",
      ];
    case "1007": // Play
      if (!playing()) {
        state.playState = 1;
        state.playedAt = Date.now();
      }
      return [];
    case "1008": // Pause
      state.playState = playing() ? 2 : state.playState === 2 ? 1 : 0;
      state.playedAt = Date.now();
      return [];
    case "40667": // Stop
      state.playState = 0;
      state.position = state.editCursor;
      return [];
    case "1013": // Record
      state.playState = 5;
      state.playedAt = Date.now();
      return [];
    case "1068": // Toggle repeat
      state.repeat = !state.repeat;
      return [];
    case "40625": // Time selection: set start point
      state.selection[0] = state.position;
      return [];
    case "40626": // Time selection: set end point
      state.selection[1] = state.position;
      return [];
    case "40172": {
      const previous = boundaries().filter((b) => b < state.position - 0.01);
      setPosition(previous[previous.length - 1] ?? 0);
      return [];
    }
    case "40173": {
      const next = boundaries().find((b) => b > state.position + 0.01);
      if (next != null) {
        setPosition(next);
      }
      return [];
    }
  }

  if (parts[0] === "GET" && parts[1] === "PROJEXTSTATE") {
    const key = `${parts[2]}/${parts[3]}`;
    return [
      ["PROJEXTSTATE", parts[2], parts[3], state.extState[key] ?? ""].join(
        "\t",
      ),
    ];
  }

  if (parts[0] === "GET" && parts[1] === "TRACK" && parts[3] === "SEND") {
    const id = Number(parts[2]);
    const index = Number(parts[4]);
    const receive = state.tracks[id]?.receives[-index - 1];
    if (index >= 0 || receive == null) {
      return [];
    }
    return [
      [
        "SEND",
        id,
        index,
        receive.mute ? 8 : 0,
        receive.volume.toFixed(6),
        "0.000000",
        receive.from,
      ].join("\t"),
    ];
  }

  if (parts[0] === "SET" && parts[1] === "POS") {
    setPosition(Number(parts[2]));
    return [];
  }

  if (parts[0] === "SET" && parts[1] === "PROJEXTSTATE") {
    state.extState[`${parts[2]}/${parts[3]}`] = parts.slice(4).join("/");
    return [];
  }

  if (parts[0] === "SET" && parts[1] === "TRACK") {
    const track = state.tracks[Number(parts[2])];
    if (track == null) {
      return [];
    }
    if (parts[3] === "VOL") {
      track.volume = Number(parts[4]);
    } else if (parts[3] === "SEND") {
      const receive = track.receives[-Number(parts[4]) - 1];
      if (receive == null) {
        return [];
      }
      if (parts[5] === "VOL") {
        receive.volume = Number(parts[6]);
      } else if (parts[5] === "MUTE") {
        receive.mute = parts[6] === "-1" ? !receive.mute : parts[6] === "1";
      }
    }
    return [];
  }

  return [];
}

function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://localhost");

  if (url.pathname === "/_mock/state") {
    advance();
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(state));
    return;
  }

  if (url.pathname === "/_mock/reset") {
    state = initialState();
    res.end("ok");
    return;
  }

  const commands = decodeURIComponent(url.pathname.slice("/_/".length))
    .split(";")
    .filter((c) => c !== "");

  advance();
  const lines: string[] = [];
  for (const command of commands) {
    if (!/^(TRANSPORT|TRACK|REGION|MARKER|GET\/)/.test(command)) {
      state.commands.push(command);
    }
    lines.push(...run(command));
  }

  res.setHeader("Content-Type", "text/plain");
  res.end(lines.map((l) => `${l}\n`).join(""));
}

export function mockReaper(): Plugin {
  return {
    name: "mock-reaper",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/_/") || req.url?.startsWith("/_mock/")) {
          handle(req, res);
        } else {
          next();
        }
      });
    },
  };
}
