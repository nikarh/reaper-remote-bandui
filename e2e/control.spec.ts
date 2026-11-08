import { expect, type Locator, type Page, test } from "@playwright/test";
import { reaper, reset } from "./helpers";

/** That a song is fully on screen and not behind the playback controls, once scrolling has settled. */
async function expectVisible(page: Page, song: Locator) {
  await expect(song).toBeInViewport({ ratio: 1 });
  await expect
    .poll(async () => {
      const nav = await page.locator("nav").boundingBox();
      const box = await song.boundingBox();
      return (box?.y ?? 0) - ((nav?.y ?? 0) + (nav?.height ?? 0));
    })
    .toBeGreaterThanOrEqual(0);
}

test.beforeEach(async ({ page, request }) => {
  await reset(request);
  await page.goto("/");
  await page.getByRole("button", { name: "Control" }).click();
  await expect(page.locator("[data-region-id]")).toHaveCount(18);
});

test("the playback controls stay on screen while the song list scrolls", async ({
  page,
}) => {
  const scroller = page.locator(".overflow-y-scroll");
  await scroller.evaluate((e) => e.scrollTo(0, e.scrollHeight));
  expect(await scroller.evaluate((e) => e.scrollTop)).toBeGreaterThan(100);

  const play = page.locator("nav button").nth(1);
  await expect(play).toBeInViewport({ ratio: 1 });
});

test("the list follows the current song", async ({ page, request }) => {
  const last = page.locator('[data-region-id="18"]');
  const viewport = page.viewportSize();
  test.skip(
    viewport == null || viewport.height > 1000,
    "the whole list fits on screen",
  );
  await expect(last).not.toBeInViewport();

  // Playback reaches the last song, as if moved on from REAPER or by the region ending.
  const calm = await page.evaluate(async () => {
    const text = await (await fetch("/_/REGION")).text();
    const line = text.split("\n").find((l) => l.startsWith("REGION\tCalm\t"));
    return Number(line?.split("\t")[3]);
  });
  await reaper(request, `SET/POS/${calm + 1}`);

  await expect(last).toHaveClass(/selected/);
  await expectVisible(page, last);

  // Back to the first one.
  await reaper(request, "SET/POS/1");
  const first = page.locator('[data-region-id="1"]');
  await expect(first).toHaveClass(/selected/);
  await expectVisible(page, first);
});
