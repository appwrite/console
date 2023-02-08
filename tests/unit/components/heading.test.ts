import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import { Heading } from '../../../src/lib/components';

test('shows heading', () => {
    const tag = 'h1';
    const size = '7';

    const { container } = render(Heading, { tag, size });

    const headings = container.querySelectorAll(tag);
    expect(headings.length).toEqual(1);
    expect(headings[0].className).includes(`heading-level-${size}`);
});
