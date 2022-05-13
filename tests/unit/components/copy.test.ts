import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/svelte';
import { Copy } from '../../../src/lib/components';

const value = 'This is a test';

test('shows copy component', () => {
    const { getByRole } = render(Copy, { value });
    const input = document.querySelector('input');
    const button = getByRole('button');

    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toBeDisabled();
});

test('copy to clipboard function called on click', async () => {
    const { getByRole } = render(Copy, { value });

    Object.assign(window.navigator, {
        clipboard: {
            writeText: jest.fn().mockImplementation(() => Promise.resolve())
        }
    });

    const button = getByRole('button');
    await fireEvent.click(button);

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('This is a test');
});
