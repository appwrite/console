import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/svelte';
import { vi } from 'vitest';
import { Code } from '../../../src/lib/components';

test('default props', async () => {
    const { container } = render(Code, {
        code: 'console.log("test");',
        language: 'js'
    });

    expect(container.querySelector('.controls')?.children.length).toEqual(0);
});

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
        withLineNumbers: true
    });

    expect(container.querySelectorAll('.line-numbers').length).toEqual(1);
    expect(container.querySelectorAll('.line-numbers-rows').length).toEqual(1);
});

test('shows code highlighted javascript', async () => {
    const { container } = render(Code, {
        code: 'console.log("test");',
        language: 'js'
    });

    expect(container.querySelectorAll('.prism-token.prism-function').length).toEqual(1);
    expect(container.querySelectorAll('.prism-token.prism-string').length).toEqual(1);
    expect(container.querySelectorAll('.prism-token.prism-punctuation').length).toEqual(4);
});

test('shows code highlighted json', async () => {
    const { container } = render(Code, {
        code: JSON.stringify({ key: 'value' }),
        language: 'json'
    });

    expect(container.querySelectorAll('.prism-token.prism-property').length).toEqual(1);
    expect(container.querySelectorAll('.prism-token.prism-operator').length).toEqual(1);
    expect(container.querySelectorAll('.prism-token.prism-string').length).toEqual(1);
    expect(container.querySelectorAll('.prism-token.prism-punctuation').length).toEqual(2);
});

test('copy to clipboard function called on click', async () => {
    const { container } = render(Code, {
        code: 'console.log("test");',
        language: 'js',
        withCopy: true
    });

    Object.assign(window.navigator, {
        clipboard: {
            writeText: vi.fn().mockImplementation(() => Promise.resolve())
        }
    });

    const button = container.querySelector('.icon-duplicate');
    expect(button).not.toBeNull();

    await fireEvent.click(button as Element);

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('console.log("test");');
});
