import { type PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    webServer: {
        env: {
            VITE_APPWRITE_ENDPOINT: 'https://stage.cloud.appwrite.io/v1',
            VITE_CONSOLE_MODE: 'cloud'
        },
        command: 'npm run build && npm run preview',
        port: 4173
    }
};

export default config;
