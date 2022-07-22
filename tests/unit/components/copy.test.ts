import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Copy from '../../../src/lib/mock/copy.test.svelte';

const value = 'This is a test';

test('copy to clipboard function called on click', async () => {
    const { getByTestId } = render(Copy, { value });

    Object.assign(window.navigator, {
        clipboard: {
            writeText: vi.fn().mockImplementation(() => Promise.resolve())
        }
    });

    const button = getByTestId('copy-content');
    await fireEvent.click(button);

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('This is a test');
});
