import { vi } from 'vitest';

vi.mock('$app/env', () => {
    return { browser: true, dev: true, prerendering: false };
});
