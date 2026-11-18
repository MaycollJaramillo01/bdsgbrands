import { defineConfig } from "@playwright/test";

// Builds its own copy with a fake GA ID (so the consent layer exists) and serves it on :3011. Uses the system Chrome.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  use: { baseURL: "http://localhost:3011", channel: "chrome" },
  webServer: {
    command: "npx next build && npx next start -p 3011",
    port: 3011,
    timeout: 240_000,
    reuseExistingServer: false,
    env: { NEXT_PUBLIC_GA_ID: "G-E2ETEST000" },
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
