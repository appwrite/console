import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { Secret } from '../../../src/lib/components';
import { tick } from 'svelte';

const value = 'This is a secret';

test('shows Secret component', () => {
    const { container } = render(Secret, { value });
    const secret = container.querySelector('span.text');
    const toggle = container.querySelector('[aria-label="show hidden text"]');
    const copy = container.querySelector('[aria-label="copy text"]');

    expect(secret).toBeInTheDocument();
    expect(toggle).toBeInTheDocument();
    expect(copy).toBeInTheDocument();
});

test('toggle secret', async () => {
    const { container } = render(Secret, { value });
    const toggle = container.querySelector('[aria-label="show hidden text"]');
    let secret = container.querySelector('span.text');
    expect(secret).not.toContainEqual(value);
    await fireEvent.click(toggle);
    secret = container.querySelector('span.text');
    expect(secret.textContent).toEqual(value);
    await fireEvent.click(toggle);
    secret = container.querySelector('span.text');
    expect(secret.textContent).not.toEqual(value);
});

test('copy to clipboard on click', async () => {
    const { container } = render(Secret, { value });
    const copy = container.querySelector('[aria-label="copy text"]');

    Object.assign(window.navigator, {
        clipboard: {
            writeText: vi.fn().mockImplementation(() => Promise.resolve())
        }
    });

    await fireEvent.click(copy);

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(value);
});
