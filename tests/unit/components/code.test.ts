import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/svelte';
import { vi } from 'vitest';
import { Code } from '../../../src/lib/components';

test('shows label', async () => {
    const { container } = render(Code, {
        code: 'console.log("test");',
        language: 'js',
        label: 'My Label'
    });

    expect(container).toContainHTML('My Label');
});

test('shows line numbers', async () => {
    const { container } = render(Code, {
        code: 'a\nb;\nc;',
        language: 'js',
        showLineNumbers: true
    });

    expect(container.querySelectorAll('.line-numbers').length).toEqual(1);
    expect(container.querySelectorAll('.line-numbers-rows').length).toEqual(1);
});

test('shows code highlighted javascript', async () => {
    const { container } = render(Code, {
        code: 'console.log("test");',
        language: 'js'
    });

    expect(container.querySelectorAll('.token.function').length).toEqual(1);
    expect(container.querySelectorAll('.token.string').length).toEqual(1);
    expect(container.querySelectorAll('.token.punctuation').length).toEqual(4);
});

test('shows code highlighted json', async () => {
    const { container } = render(Code, {
        code: JSON.stringify({ key: 'value' }),
        language: 'json'
    });

    expect(container.querySelectorAll('.token.property').length).toEqual(1);
    expect(container.querySelectorAll('.token.operator').length).toEqual(1);
    expect(container.querySelectorAll('.token.string').length).toEqual(1);
    expect(container.querySelectorAll('.token.punctuation').length).toEqual(2);
});

test('copy to clipboard function called on click', async () => {
    const { container } = render(Code, {
        code: 'console.log("test");',
        language: 'js',
        showCopy: true
    });

    Object.assign(window.navigator, {
        clipboard: {
            writeText: vi.fn().mockImplementation(() => Promise.resolve())
        }
    });

    const button = container.querySelector('.icon-duplicate');

    await fireEvent.click(button);

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('console.log("test");');
});
