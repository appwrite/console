import { config as loadEnv } from 'dotenv';
import { type PlaywrightTestConfig } from '@playwright/test';

loadEnv();

const config: PlaywrightTestConfig = {
    timeout: 120000,
    reportSlowTests: null,
    reporter: [['html', { open: 'never' }]],
    // retries: 3,
    testDir: 'e2e',
    use: {
        baseURL: 'http://localhost:3000/console/',
        trace: 'on-first-retry'
    },
    webServer: {
        timeout: 120000,
        env: {
            PUBLIC_APPWRITE_ENDPOINT:
                process.env.PUBLIC_APPWRITE_ENDPOINT || 'https://stage.cloud.appwrite.io/v1',
            PUBLIC_CONSOLE_MODE: process.env.PUBLIC_CONSOLE_MODE || 'cloud',
            PUBLIC_APPWRITE_MULTI_REGION: process.env.PUBLIC_APPWRITE_MULTI_REGION || 'true',
            PUBLIC_STRIPE_KEY:
                process.env.PUBLIC_STRIPE_KEY ||
                'pk_test_51LT5nsGYD1ySxNCyd7b304wPD8Y1XKKWR6hqo6cu3GIRwgvcVNzoZv4vKt5DfYXL1gRGw4JOqE19afwkJYJq1g3K004eVfpdWn'
        },
        command: 'pnpm run dev',
        port: 3000,
        reuseExistingServer: true
    }
};

export default config;
