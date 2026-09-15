import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import EnumColumn, { submitEnum, updateEnum } from './enum.svelte';
import { sdk } from '$lib/stores/sdk';

vi.mock('$lib/elements/forms', async () => ({
    InputSelect: (await import('$lib/elements/forms/inputSelect.svelte')).default
}));
vi.mock('$app/state', () => ({ page: { params: { region: 'fra', project: 'project' } } }));
vi.mock('$lib/stores/sdk', () => ({ sdk: { forProject: vi.fn() } }));

afterEach(cleanup);

it('does not restore a default that was removed while the column was required', async () => {
    const user = userEvent.setup();
    const data = {
        elements: ['New York', 'Tokyo'],
        default: 'New York',
        required: false,
        array: false
    };
    render(EnumColumn, { data });
    const toggle = screen.getByRole('checkbox', { name: /^Required/ });
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: 'Remove New York' }));
    await user.click(toggle);

    expect(data.default).toBeNull();
    expect(screen.getByRole('combobox', { name: /^Default value/ })).toHaveTextContent('NULL');
});

it('preserves and selects multi-word defaults and clears a removed default', async () => {
    const user = userEvent.setup();
    const data = {
        elements: ['New York', 'Tokyo'],
        default: 'New York',
        required: false,
        array: false
    };
    render(EnumColumn, { data });
    const select = screen.getByRole('combobox', { name: /^Default value/ });
    expect(select).toHaveTextContent('New York');

    await user.type(screen.getByRole('textbox', { name: /^Elements/ }), 'Nizhny Novgorod{Enter}');
    expect(data.default).toBe('New York');
    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'Nizhny Novgorod' }));
    expect(data.default).toBe('Nizhny Novgorod');

    await user.click(screen.getByRole('button', { name: 'Remove Nizhny Novgorod' }));
    expect(data.default).toBeNull();
    expect(select).toHaveTextContent('NULL');
});

it.each(['Required', 'Array'])('restores a valid default after toggling %s', async (name) => {
    const user = userEvent.setup();
    const data = { elements: ['New York'], default: 'New York', required: false, array: false };
    render(EnumColumn, { data });
    const toggle = screen.getByRole('checkbox', { name: new RegExp(`^${name}`) });
    const select = screen.getByRole('combobox', { name: /^Default value/ });

    await user.click(toggle);
    expect(data.default).toBeNull();
    expect(select).toBeDisabled();

    await user.click(toggle);
    expect(data.default).toBe('New York');
    expect(select).toBeEnabled();
});

it('creates an enum with complete values and the selected multi-word default', async () => {
    const user = userEvent.setup();
    const createEnumColumn = vi.fn().mockResolvedValue({});
    vi.mocked(sdk.forProject).mockReturnValue({ tablesDB: { createEnumColumn } } as never);
    const data = { elements: [], default: null, required: false, array: false };
    render(EnumColumn, { data });

    await user.type(screen.getByRole('textbox', { name: /^Elements/ }), 'New York, NY{Enter}');
    await user.click(screen.getByRole('combobox', { name: /^Default value/ }));
    await user.click(screen.getByRole('option', { name: 'New York, NY' }));
    await submitEnum('database', 'table', 'city', data);

    expect(sdk.forProject).toHaveBeenCalledWith('fra', 'project');
    expect(createEnumColumn).toHaveBeenCalledExactlyOnceWith({
        databaseId: 'database',
        tableId: 'table',
        key: 'city',
        elements: ['New York, NY'],
        required: false,
        xdefault: 'New York, NY',
        array: false
    });
});

it.each([
    ['city', undefined],
    ['destination', 'destination']
])('edits complete enum values with key %s and the original route key', async (key, newKey) => {
    const user = userEvent.setup();
    const updateEnumColumn = vi.fn().mockResolvedValue({});
    vi.mocked(sdk.forProject).mockReturnValue({ tablesDB: { updateEnumColumn } } as never);
    const data = {
        key,
        elements: ['New York, NY', 'Tokyo'],
        default: 'New York, NY',
        required: false,
        array: false
    };
    render(EnumColumn, { data, editing: true });

    await user.type(screen.getByRole('textbox', { name: /^Elements/ }), 'Nizhny Novgorod{Enter}');
    await user.click(screen.getByRole('button', { name: 'Remove Tokyo' }));
    await updateEnum('database', 'table', data, 'city');

    expect(updateEnumColumn).toHaveBeenCalledExactlyOnceWith({
        databaseId: 'database',
        tableId: 'table',
        key: 'city',
        elements: ['New York, NY', 'Nizhny Novgorod'],
        required: false,
        xdefault: 'New York, NY',
        newKey
    });
});
