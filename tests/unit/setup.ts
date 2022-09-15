import { vi } from 'vitest';

beforeAll(() => {
    vi.mock('$app/environment', () => ({
        browser: 'window' in globalThis
    }));
});
