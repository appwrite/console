import '@testing-library/jest-dom/vitest';
import { beforeAll, vi } from 'vitest';

beforeAll(() => {
    vi.mock('$app/environment', () => ({
        dev: true,
        building: false,
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
