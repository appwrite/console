import { type PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    timeout: 120000,
    reportSlowTests: null,
    reporter: [['html', { open: 'never' }]],
    retries: 3,
    use: {
        trace: 'on-first-retry'
    },
    webServer: {
        timeout: 120000,
        env: {
            VITE_APPWRITE_ENDPOINT: 'http://console-tests.appwrite.org/v1',
            VITE_CONSOLE_MODE: 'cloud',
            VITE_STRIPE_PUBLIC_KEY:
                'pk_test_51LT5nsGYD1ySxNCyd7b304wPD8Y1XKKWR6hqo6cu3GIRwgvcVNzoZv4vKt5DfYXL1gRGw4JOqE19afwkJYJq1g3K004eVfpdWn'
        },
        command: 'npm run build && npm run preview',
        port: 4173
    }
};

export default config;
