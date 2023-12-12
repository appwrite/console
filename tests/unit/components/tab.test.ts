import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { Tab } from '../../../src/lib/components';

test('shows tab', () => {
    const { getByRole } = render(Tab);

    expect(getByRole('tab')).toBeInTheDocument();
});
test('shows tab - is selected', () => {
    const { getByRole } = render(Tab, { selected: true });

    expect(getByRole('tab')).toHaveClass('is-selected');
});

test('shows tab - is link', () => {
    render(Tab, { href: 'https://appwrite.io' });
    const link = document.querySelector('a');

    expect(link).toHaveAttribute('href', 'https://appwrite.io');
});

test('shows tab - on:click', async () => {
    const { getByRole, component } = render(Tab);
    const tab = getByRole('tab');
    const callback = vi.fn();
    component.$on('click', callback);

    await fireEvent.click(tab);
    expect(callback).toHaveBeenCalled();
});
