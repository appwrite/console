import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import EnumElements from './enumElements.svelte';

afterEach(cleanup);

it('keeps a multi-word enum element together when submitted', async () => {
    const user = userEvent.setup();
    render(EnumElements);

    await user.type(screen.getByRole('textbox', { name: 'Elements' }), 'Nizhny Novgorod{Enter}');

    expect(screen.getByText('Nizhny Novgorod')).toBeInTheDocument();
    expect(screen.queryByText('Nizhny')).not.toBeInTheDocument();
});

it.each(['New York, NY', 'MTS BS73 Home', 'North / South'])(
    'keeps pasted %s as one element',
    async (value) => {
        const user = userEvent.setup();
        render(EnumElements);

        await user.click(screen.getByRole('textbox', { name: 'Elements' }));
        await user.paste(value);
        await user.click(screen.getByRole('button', { name: 'Add' }));

        expect(screen.getByRole('button', { name: `Remove ${value}` })).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(1);
    }
);
