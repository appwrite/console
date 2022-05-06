import '@testing-library/jest-dom';
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
    const callback = jest.fn();
    component.$on('click', callback);

    await fireEvent.click(button);
    expect(callback).toHaveBeenCalled();
});
