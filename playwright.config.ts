import { type PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    timeout: 60000,
    webServer: {
        env: {
            VITE_APPWRITE_ENDPOINT: 'http://console-tests.appwrite.org/v1',
            VITE_CONSOLE_MODE: 'cloud'
        },
        command: 'npm run build && npm run preview',
        port: 4173
    }
};

export default config;
