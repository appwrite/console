import '@testing-library/jest-dom/vitest';
import { beforeAll, vi } from 'vitest';

// required for svelte5 + jsdom as jsdom does not support matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    enumerable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
});

beforeAll(() => {
    vi.mock('$app/environment', () => ({
        browser: true
    }));
    vi.mock('$app/navigation', () => ({
        goto: vi.fn(),
        beforeNavigate: vi.fn()
    }));
    vi.mock('$app/environment', () => ({
        dev: true,
        browser: true
    }));
    vi.mock('$env/static/public', () => import.meta.env);
    vi.mock('$env/dynamic/public', () => ({
        env: import.meta.env
    }));
});
