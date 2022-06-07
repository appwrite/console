import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/svelte';

import { Button } from '../../../src/lib/elements/forms';

test('shows button', () => {
    const { getByRole } = render(Button);

    expect(getByRole('button')).toBeInTheDocument();
});

test('shows button - disabled', () => {
    const { getByRole } = render(Button, { disabled: true });

    expect(getByRole('button')).toBeDisabled();
});

test('shows button - submit', () => {
    const { getByRole } = render(Button, { submit: true });

    expect(getByRole('button')).toHaveAttribute('type', 'submit');
});

test('shows button - secondary', () => {
    const { getByRole } = render(Button, { secondary: true });

    expect(getByRole('button')).toHaveClass('is-secondary');
});
test('shows button - text', () => {
    const { getByRole } = render(Button, { text: true });

    expect(getByRole('button')).toHaveClass('is-text');
});

test('shows button - on:click', async () => {
    const { getByRole, component } = render(Button);
    const button = getByRole('button');
    const callback = jest.fn();
    component.$on('click', callback);

    await fireEvent.click(button);
    expect(callback).toHaveBeenCalled();
});
