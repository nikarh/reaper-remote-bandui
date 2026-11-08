import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// Runs against the mock REAPER (mock/reaper.ts). PLAYWRIGHT_CHROMIUM points at a Chromium to use instead of the one
// `npx playwright install chromium` downloads, e.g. /usr/bin/chromium.
export default defineConfig({
  testDir: "e2e",
  // The mock keeps one REAPER state for everybody.
  workers: 1,
  fullyParallel: false,
  forbidOnly: process.env.CI != null,
  retries: process.env.CI != null ? 1 : 0,
  reporter: process.env.CI != null ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined,
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `vite --mode mock --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    env: { BROWSER: "none" },
    reuseExistingServer: process.env.CI == null,
  },
});
