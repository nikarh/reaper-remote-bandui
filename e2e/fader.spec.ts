import { expect, type Locator, type Page, test } from "@playwright/test";
import { dbToGain, mockState, reset, touchGesture } from "./helpers";

// The mix of "PA [1+2]" (track 12) is shown first: its own fader, then its receives from Backtrack (track 4) and
// Vocal Backtrack (track 5), both at 0 dB.
const PA = 12;

test.beforeEach(async ({ page, request }) => {
  await reset(request);
  await page.goto("/");
  await expect(page.getByRole("slider")).toHaveCount(3);
});

async function receiveGain(page: Page, index: number) {
  const state = await mockState(page.request);
  return state.tracks[PA].receives[index].volume;
}

async function box(fader: Locator) {
  const b = await fader.boundingBox();
  if (b == null) throw new Error("fader is not visible");
  return b;
}

async function drag(page: Page, fader: Locator, from: number, to: number) {
  const b = await box(fader);
  const y = b.y + b.height / 2;
  const start = { x: b.x + b.width * from, y };
  const end = { x: b.x + b.width * to, y };
  if (test.info().project.name === "mobile") {
    await touchGesture(page, start, end);
  } else {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 12 });
    await page.mouse.up();
  }
}

test("a tap does not move the fader", async ({ page }) => {
  const fader = page.getByRole("slider").nth(1);
  const b = await box(fader);
  const point = { x: b.x + b.width * 0.1, y: b.y + b.height / 2 };
  if (test.info().project.name === "mobile") {
    await page.touchscreen.tap(point.x, point.y);
  } else {
    await page.mouse.click(point.x, point.y);
  }
  await page.waitForTimeout(300);

  await expect(fader.getByTestId("db")).toHaveText("0.0 dB");
  expect(await receiveGain(page, 0)).toBe(1);
  const { commands } = await mockState(page.request);
  expect(commands.filter((c) => c.includes("/VOL/"))).toEqual([]);
});

test("a drag moves the fader by the distance dragged, not to the finger", async ({
  page,
}) => {
  const fader = page.getByRole("slider").nth(1);
  // 0 dB sits at 71.875% of the travel; 20% to the left of it is -20 dB + (0.51875 - 0.25) / 0.75 * 32 dB = -8.5 dB.
  // The drag starts at 30%: the fader must not jump there.
  await drag(page, fader, 0.3, 0.1);

  await expect(fader.getByTestId("db")).toHaveText("-8.5 dB");
  await expect.poll(() => receiveGain(page, 0)).toBeCloseTo(dbToGain(-8.53), 2);
  // The other receive is untouched.
  expect(await receiveGain(page, 1)).toBe(1);
});

test("a drag goes above 0 dB", async ({ page }) => {
  const fader = page.getByRole("slider").nth(1);
  await drag(page, fader, 0.5, 0.9);
  await expect(fader.getByTestId("db")).toHaveText("+12.0 dB");
  await expect.poll(() => receiveGain(page, 0)).toBeCloseTo(dbToGain(12), 2);
});

test("a vertical swipe scrolls the page and leaves the fader alone", async ({
  page,
}) => {
  test.skip(test.info().project.name !== "mobile", "touch only");
  // Enough receives to scroll: Drums [3+4] has seven, on a short screen.
  await page.setViewportSize({ width: 412, height: 500 });
  await page.getByRole("combobox").selectOption({ index: 1 });
  await expect(page.getByRole("slider")).toHaveCount(8);

  const fader = page.getByRole("slider").nth(4);
  const b = await box(fader);
  const scroller = page.locator(".overflow-y-scroll");
  const before = await scroller.evaluate((e) => e.scrollTop);
  await touchGesture(
    page,
    { x: b.x + b.width * 0.5, y: b.y + b.height / 2 },
    { x: b.x + b.width * 0.5, y: b.y + b.height / 2 - 250 },
  );
  await page.waitForTimeout(300);

  expect(await scroller.evaluate((e) => e.scrollTop)).toBeGreaterThan(before);
  const { commands } = await mockState(page.request);
  expect(commands.filter((c) => c.includes("/VOL/"))).toEqual([]);
});

test("arrow keys move the focused fader", async ({ page }) => {
  test.skip(test.info().project.name !== "desktop", "keyboard only");
  const fader = page.getByRole("slider").nth(1);
  await fader.focus();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("ArrowRight");
  }
  // 5% of the travel above 0 dB: 0.05 / 0.75 * 32 dB.
  await expect(fader.getByTestId("db")).toHaveText("+2.1 dB");
  await expect.poll(() => receiveGain(page, 0)).toBeCloseTo(dbToGain(2.13), 2);
});

test("levels above 0 dB are shown as they are", async ({ page }) => {
  // Bass [5+6] receives Bass [3] at +3 dB.
  await page.getByRole("combobox").selectOption({ index: 2 });
  const fader = page.getByRole("slider").filter({ hasText: "Bass [3]" });
  await expect(fader.getByTestId("db")).toHaveText("+3.0 dB");
});
