import { vi } from 'vitest';

beforeAll(() => {
    vi.mock('$app/environment', () => ({
        browser: true
    }));
    vi.mock('$app/stores', () => ({
        page: null
    }));
    vi.mock('$app/navigation', () => ({
        goto: vi.fn()
    }));
});
