import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { SecondaryTabsItem } from '../../../src/lib/components';

test('shows button', () => {
    const { getByRole } = render(SecondaryTabsItem);

    expect(getByRole('button')).toBeInTheDocument();
});

test('shows link', () => {
    render(SecondaryTabsItem, { href: 'https://www.appwrite.io' });
    const href = document.querySelector('a');
    expect(href).toBeInTheDocument();
});

test('shows button - disabled', () => {
    const { getByRole } = render(SecondaryTabsItem, { href: null, disabled: true });

    expect(getByRole('button')).toBeDisabled();
});

test('shows button - on:click', async () => {
    const { getByRole, component } = render(SecondaryTabsItem);
    const button = getByRole('button');

    const callback = vi.fn();
    component.$on('click', callback);

    await fireEvent.click(button);
    expect(callback).toHaveBeenCalled();
});
