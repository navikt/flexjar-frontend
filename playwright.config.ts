import { defineConfig, devices } from '@playwright/test'
import { PlaywrightTestConfig } from 'playwright/types/test'

const PORT = process.env.PORT || 3000

type OptionsType = { baseURL: string; timeout: number; server: PlaywrightTestConfig['webServer'] }
const opts: OptionsType =
    process.env.CI || process.env.FAST
        ? // Github Actions runs server in a services image
          {
              baseURL: `http://localhost:${PORT}`,
              timeout: 30 * 1000,
              server: {
                  command: 'MOCK_BACKEND=true npm run start',
                  url: `http://localhost:${PORT}`,
                  timeout: 120 * 1000,
                  reuseExistingServer: !process.env.CI,
              },
          }
        : // Local dev server
          {
              baseURL: `http://localhost:${PORT}`,
              timeout: 60 * 1000,
              server: {
                  command: 'npm run dev',
                  url: `http://localhost:${PORT}`,
                  timeout: 120 * 1000,
                  reuseExistingServer: !process.env.CI,
                  stderr: 'pipe',
                  stdout: 'pipe',
              },
          }

export default defineConfig({
    testDir: './e2e',
    expect: {
        timeout: 10 * 1000,
    },
    timeout: opts.timeout,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: opts.baseURL,
        trace: 'on-first-retry',
    },
    webServer: opts.server,
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
})
