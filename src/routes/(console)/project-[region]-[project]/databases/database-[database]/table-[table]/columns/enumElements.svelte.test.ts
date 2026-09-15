import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import InputTags from '$lib/elements/forms/inputTags.svelte';

afterEach(cleanup);

it('keeps a multi-word enum element together when submitted', async () => {
    const user = userEvent.setup();
    render(InputTags, { id: 'elements', label: 'Elements', required: true });

    await user.type(screen.getByRole('textbox', { name: 'Elements' }), 'Nizhny Novgorod{Enter}');

    expect(screen.getByText('Nizhny Novgorod')).toBeInTheDocument();
    expect(screen.queryByText('Nizhny')).not.toBeInTheDocument();
});
