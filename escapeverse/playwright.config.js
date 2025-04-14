// playwright.config.js

/* eslint-env node */

export default {
    testDir: './tests',
    timeout: 30000,
    expect: {
      timeout: 5000
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
      baseURL: 'http://localhost:5173',
      trace: 'on-first-retry',
      screenshot: 'only-on-failure'
    },
    projects: [
      {
        name: 'Desktop Chrome',
        use: {
          browserName: 'chromium',
          viewport: { width: 1920, height: 1080 }
        }
      },
      {
        name: 'Desktop Firefox',
        use: {
          browserName: 'firefox',
          viewport: { width: 1920, height: 1080 }
        }
      },
      {
        name: 'Tablet',
        use: {
          browserName: 'webkit',
          viewport: { width: 768, height: 1024 }
        }
      },
      {
        name: 'Mobile',
        use: {
          browserName: 'chromium',
          viewport: { width: 375, height: 667 },
          deviceScaleFactor: 2,
          isMobile: true
        }
      }
    ],
    webServer: {
      command: 'npm run dev',
      port: 5173,
      reuseExistingServer: !process.env.CI
    }
  };
  