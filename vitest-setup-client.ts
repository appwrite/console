import '@testing-library/jest-dom/vitest';
import { beforeAll, vi } from 'vitest';

// jsdom hands back a bare object for web storage under this runtime, so the
// console's `localStorage` reads blow up before any component renders
function createStorage(): Storage {
    const entries = new Map<string, string>();

    return {
        get length() {
            return entries.size;
        },
        key: (index: number) => [...entries.keys()][index] ?? null,
        getItem: (key: string) => entries.get(key) ?? null,
        setItem: (key: string, value: string) => void entries.set(key, String(value)),
        removeItem: (key: string) => void entries.delete(key),
        clear: () => entries.clear()
    };
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
    if (typeof window[name]?.getItem === 'function') continue;

    Object.defineProperty(window, name, {
        writable: true,
        configurable: true,
        value: createStorage()
    });
}

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

// jsdom ships no ResizeObserver, which pink-svelte's FloatingActionBar constructs on mount
Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    }
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
