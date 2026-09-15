import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import EnumElements from './enumElements.svelte';

afterEach(cleanup);

it('preserves loaded elements exactly and follows changes to the edited column', async () => {
    const { rerender } = render(EnumElements, { elements: ['New York, NY', '0', 'A  B'] });

    expect(
        screen
            .getAllByRole('button', { name: /^Remove / })
            .map((button) => button.getAttribute('aria-label'))
    ).toEqual(['Remove New York, NY', 'Remove 0', 'Remove A  B']);

    await rerender({ elements: ['Nizhny Novgorod'] });

    expect(screen.getByRole('button', { name: 'Remove Nizhny Novgorod' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove New York, NY' })).not.toBeInTheDocument();
});

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
