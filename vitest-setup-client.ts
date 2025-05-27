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
        dev: true,
        building: true,
        browser: true,
        page: {
            params: {
                project: 'tests',
                region: 'tests'
            }
        }
    }));
    vi.mock('$app/navigation', () => ({
        goto: vi.fn(),
        beforeNavigate: vi.fn()
    }));
    vi.mock('$env/static/public', () => import.meta.env);
    vi.mock('$env/dynamic/public', () => ({
        env: import.meta.env
    }));
});
