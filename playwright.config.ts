import { type PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    timeout: 240000,
    reportSlowTests: null,
    reporter: [['html', { open: 'never' }]],
    retries: 3,
    testDir: 'e2e',
    use: {
        baseURL: 'http://localhost:4173/console/',
        trace: 'on-first-retry'
    },
    webServer: {
        timeout: 240000,
        env: {
            NODE_OPTIONS: '--max_old_space_size=8192',
            PUBLIC_CONSOLE_PROFILE: 'console',
            PUBLIC_AI_SERVICE_BASE_URL: 'http://appwrite.test/v1',
            PUBLIC_APPWRITE_SITES_BASE_URL: 'https://appwrite.network',
            PUBLIC_REALTIME_URI: 'ws://appwrite.test/v1',
            PUBLIC_APPWRITE_ENDPOINT: 'https://stage.cloud.appwrite.io/v1',
            PUBLIC_CONSOLE_MODE: 'cloud',
            PUBLIC_APPWRITE_MULTI_REGION: 'true',
            PUBLIC_STRIPE_KEY:
                'pk_test_51LT5nsGYD1ySxNCyd7b304wPD8Y1XKKWR6hqo6cu3GIRwgvcVNzoZv4vKt5DfYXL1gRGw4JOqE19afwkJYJq1g3K004eVfpdWn'
        },
        command: 'pnpm run build && pnpm run preview',
        port: 4173
    }
};

export default config;
