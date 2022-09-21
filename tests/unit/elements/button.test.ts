import '@testing-library/jest-dom';
import { vi } from 'vitest';
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

test('shows button - danger', () => {
    const { getByRole } = render(Button, { danger: true });

    expect(getByRole('button')).toHaveClass('is-danger');
});

test('shows button - round', () => {
    const { getByRole } = render(Button, { round: true });

    expect(getByRole('button')).toHaveClass('is-only-icon');
});
test('shows button - full width', () => {
    const { getByRole } = render(Button, { fullWidth: true });

    expect(getByRole('button')).toHaveClass('is-full-width');
});

test('shows button - is link', () => {
    render(Button, { href: 'https://appwrite.io' });
    const link = document.querySelector('a');

    expect(link).toHaveAttribute('href', 'https://appwrite.io');
});
test('shows button - is link is external', () => {
    render(Button, { href: 'https://appwrite.io', external: true });
    const link = document.querySelector('a');

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});

test('shows button - on:click', async () => {
    const { getByRole, component } = render(Button);
    const button = getByRole('button');
    const callback = vi.fn();
    component.$on('click', callback);

    await fireEvent.click(button);
    expect(callback).toHaveBeenCalled();
});
