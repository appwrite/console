import { type PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
    timeout: 120000,
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        },
        // {
        //     name: 'webkit',
        //     use: { ...devices['Desktop Safari'] }
        // }
    ],
    reportSlowTests: null,
    webServer: {
        stderr: 'ignore',
        stdout: 'ignore',
        env: {
            VITE_APPWRITE_ENDPOINT: 'http://console-tests.appwrite.org/v1',
            VITE_CONSOLE_MODE: 'cloud'
        },
        command: 'npm run build && npm run preview',
        port: 4173
    }
};

export default config;
