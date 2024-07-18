import '@testing-library/jest-dom/vitest';
import { beforeAll, vi } from 'vitest';

beforeAll(() => {
    vi.mock('$app/environment', () => ({
        browser: true
    }));
    vi.mock('$app/navigation', () => ({
        goto: vi.fn()
    }));
});
