import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { wizard } from './wizard';

vi.mock('$lib/actions/analytics', () => ({ trackEvent: vi.fn() }));

describe('wizard exit handler ownership', () => {
    beforeEach(() => wizard.hide());

    it('unregisters the handler owned by the closing component', () => {
        const handler = vi.fn();
        const unregister = wizard.setExitHandler(handler);

        expect(get(wizard).exitHandler).toBe(handler);
        unregister();

        expect(get(wizard).exitHandler).toBeNull();
    });

    it('does not unregister a replacement component handler', () => {
        const unregister = wizard.setExitHandler(vi.fn());
        const replacement = vi.fn();
        wizard.setExitHandler(replacement);

        unregister();

        expect(get(wizard).exitHandler).toBe(replacement);
    });

    it('clears the previous handler when another wizard starts', () => {
        const unregister = wizard.setExitHandler(vi.fn());

        wizard.start(() => ({}));
        expect(get(wizard).exitHandler).toBeNull();

        const replacement = vi.fn();
        wizard.setExitHandler(replacement);
        unregister();
        expect(get(wizard).exitHandler).toBe(replacement);
    });

    it('clears navigation interception when the wizard is hidden', () => {
        wizard.start(() => ({}));
        wizard.setExitHandler(vi.fn());

        wizard.hide();

        expect(get(wizard).show).toBe(false);
        expect(get(wizard).exitHandler).toBeNull();
    });
});
