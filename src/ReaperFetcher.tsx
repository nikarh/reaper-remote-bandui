import { createEffect, createSignal } from "solid-js";

export enum State {
    Playing,
    Paused,
    Stopped,
}

declare global {
    interface Window {
        wwr_onreply: (results: string) => void,
        wwr_req: (command: string) => void,
        wwr_req_recur: (command: string, timeout: number) => void,
    }
}
export interface Track {
    id: number;
    name: string;
    volume: number;
    mute: boolean;
    level: number;
    color: string;
}

export interface Region {
    id: number;
    name: string;
    startTime: number;
    endTime: number;
    color: number;
}

const [tracks, setTracks] = createSignal<Track[]>([]);
const [playState, setPlayState] = createSignal(State.Stopped);
const [regions, setRegions] = createSignal<Region[]>([]);
const [currentTime, setCurrentTime] = createSignal(0);

function regionsEqual(a: Region, b: Region): boolean {
    return a.id == b.id
        && a.name == b.name
        && a.startTime == b.startTime
        && a.endTime == b.endTime
        && a.color == b.color;
}

function regionsChanged(newRegions: Region[]): boolean {
    let oldRegions = regions();
    if (newRegions.length != oldRegions.length) return true;
    let areSame = newRegions.reduce((res, val, i) => res && regionsEqual(val, oldRegions[i]), true);
    return !areSame;
}

window.wwr_onreply = function (result: string) {
    const lines = result.split("\n");
    for (let line of lines) {
        var tokens = line.split("\t");
        if (tokens.length == 0) {
            continue;
        }

        let regionStrings: string[][] = [];
        let checkCurrentRegion = false;

        switch (tokens[0]) {
            case "TRANSPORT": {
                if (tokens.length < 5) {
                    continue;
                }

                setPlayState(((state) => {
                    if (state & 1) return State.Playing;
                    if (state & 2) return State.Paused;
                    return State.Stopped;
                })(parseInt(tokens[1])));

                setCurrentTime(parseFloat(tokens[2]));
                checkCurrentRegion = true;

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
                checkCurrentRegion = true;
                const newRegions = tokens.map(([_cmd, name, id, startTime, endTime, color]) => (
                    {
                        name,
                        id: parseInt(id),
                        startTime: parseFloat(startTime),
                        endTime: parseFloat(endTime),
                        color: parseInt(color),
                    }
                ));

                if (regionsChanged(newRegions)) {
                    setRegions(newRegions);
                }

                break;
            }
        }

        if (checkCurrentRegion) {

        }
    }
}

export function ReaperFetcher() {
    createEffect(() => {
        window.

            wwr_req_recur("TRANSPORT;BEATPOS", 10);
        wwr_req_recur("NTRACK;TRACK;GET/40364;GET/1157", 500);
        wwr_req_recur("REGION", 1000);
    });

    return (<></>)
}