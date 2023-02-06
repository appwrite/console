import { vi } from 'vitest';
import * as svelteinternal from 'svelte/internal';

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
    vi.mock('svelte', () => svelteinternal);
});
