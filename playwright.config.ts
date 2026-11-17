import { defineConfig } from "@playwright/test";

// Uses the system Chrome (no browser download). Run `npm run build` first.
export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:3011", channel: "chrome" },
  webServer: { command: "npx next start -p 3011", port: 3011, reuseExistingServer: true },
  projects: [{ name: "desktop" }, { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }],
});
