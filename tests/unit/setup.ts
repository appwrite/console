import '@testing-library/jest-dom/vitest';
import { beforeAll, vi } from 'vitest';

beforeAll(() => {
    vi.mock('$app/navigation', () => ({
        goto: vi.fn(),
        beforeNavigate: vi.fn()
    }));
    vi.mock('$app/environment', () => ({
        dev: true,
        browser: true,
        building: true
    }));
    vi.mock('$env/static/public', () => import.meta.env);
    vi.mock('$env/dynamic/public', () => ({
        env: import.meta.env
    }));
});
