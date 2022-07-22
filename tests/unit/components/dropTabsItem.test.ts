import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { DropTabsItem } from '../../../src/lib/components';

test('shows button', () => {
    const { getByRole } = render(DropTabsItem);

    expect(getByRole('button')).toBeInTheDocument();
});

test('shows button - disabled', () => {
    const { getByRole } = render(DropTabsItem, { disabled: true });

    expect(getByRole('button')).toBeDisabled();
});

test('shows button - on:click', async () => {
    const { getByRole, component } = render(DropTabsItem);
    const button = getByRole('button');

    const callback = vi.fn();
    component.$on('click', callback);

    await fireEvent.click(button);
    expect(callback).toHaveBeenCalled();
});
