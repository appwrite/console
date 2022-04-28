import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import { Copy } from '../../../src/lib/components';

//TODO: test after button click value is copied to clipboard

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
