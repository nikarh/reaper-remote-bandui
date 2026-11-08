import type { APIRequestContext, Page } from "@playwright/test";

export interface MockState {
  playState: number;
  position: number;
  tracks: {
    name: string;
    volume: number;
    receives: { from: number; volume: number; mute: boolean }[];
  }[];
  commands: string[];
}

export async function reset(request: APIRequestContext) {
  await request.post("/_mock/reset");
}

export async function mockState(
  request: APIRequestContext,
): Promise<MockState> {
  return (await request.get("/_mock/state")).json();
}

/** Sends commands to the mock as if REAPER was operated elsewhere. */
export async function reaper(request: APIRequestContext, commands: string) {
  await request.get(`/_/${commands}`);
}

type Point = { x: number; y: number };

/** A one-finger touch gesture through the browser's input pipeline, so touch-action and scrolling apply. */
export async function touchGesture(page: Page, from: Point, to: Point) {
  const cdp = await page.context().newCDPSession(page);
  const steps = 12;
  const point = (t: number) => [
    {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
      id: 1,
    },
  ];
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: point(0),
  });
  for (let i = 1; i <= steps; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: point(i / steps),
    });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await cdp.detach();
}

export function dbToGain(db: number) {
  return 10 ** (db / 20);
}
