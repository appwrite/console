import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import EnumElements from './enumElements.svelte';

afterEach(cleanup);

it('prevents edits while disabled and supports enabling the same control', async () => {
    const user = userEvent.setup();
    const { rerender } = render(EnumElements, { elements: ['New York'], disabled: true });
    const input = screen.getByRole('textbox', { name: /^Elements/ });
    const remove = screen.getByRole('button', { name: 'Remove New York' });

    expect(input).toBeDisabled();
    expect(remove).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    await user.click(remove);
    expect(remove).toBeInTheDocument();

    await rerender({ elements: ['New York'], disabled: false });
    await user.type(input, 'Tokyo{Enter}');

    expect(screen.getByRole('button', { name: 'Remove Tokyo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove New York' })).toBeInTheDocument();
});

it('waits for composition to finish when focus leaves during IME input', async () => {
    render(EnumElements);
    const input = screen.getByRole('textbox', { name: 'Elements' });
    await fireEvent.compositionStart(input);
    await fireEvent.input(input, { target: { value: '東' } });
    await fireEvent.blur(input);

    expect(screen.queryByRole('button', { name: /^Remove / })).not.toBeInTheDocument();

    await fireEvent.input(input, { target: { value: '東京' } });
    await fireEvent.compositionEnd(input);

    expect(screen.getByRole('button', { name: 'Remove 東京' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove 東' })).not.toBeInTheDocument();
    expect(input).toHaveValue('');
});

it('removes the chosen value and restores input focus and required validation', async () => {
    const user = userEvent.setup();
    render(EnumElements, { elements: ['New York', 'Tokyo'] });
    const input = screen.getByRole('textbox', { name: /^Elements/ });

    await user.click(screen.getByRole('button', { name: 'Remove New York' }));

    expect(screen.queryByRole('button', { name: 'Remove New York' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Tokyo' })).toBeInTheDocument();
    expect(input).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Remove Tokyo' }));

    expect(input).toHaveFocus();
    expect(input).toBeRequired();
    expect(input).toBeInvalid();
});

it('does not commit the Enter key used to confirm an IME composition', async () => {
    const user = userEvent.setup();
    render(EnumElements);
    const input = screen.getByRole('textbox', { name: 'Elements' });
    await user.type(input, '東京');
    await fireEvent.keyDown(input, { key: 'Enter', isComposing: true });

    expect(input).toHaveValue('東京');
    expect(screen.queryByRole('button', { name: /^Remove / })).not.toBeInTheDocument();

    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Remove 東京' })).toBeInTheDocument();
});

it('commits a complete value on Tab without trapping keyboard focus', async () => {
    const user = userEvent.setup();
    render(EnumElements);
    const input = screen.getByRole('textbox', { name: 'Elements' });

    await user.type(input, 'New York');
    await user.tab();

    expect(screen.getByRole('button', { name: 'Remove New York' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toHaveFocus();
    expect(input).toHaveValue('');

    await user.click(input);
    await user.tab();
    expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(1);
});

it('adds with Enter without submitting the surrounding form', async () => {
    const user = userEvent.setup();
    const form = document.createElement('form');
    const submit = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener('submit', submit);
    document.body.append(form);
    const save = document.createElement('button');
    save.type = 'submit';
    save.textContent = 'Save';

    try {
        render(EnumElements, { target: form });
        form.append(save);
        await user.type(screen.getByRole('textbox', { name: 'Elements' }), 'New York{Enter}');

        expect(screen.getByRole('button', { name: 'Remove New York' })).toBeInTheDocument();
        expect(submit).not.toHaveBeenCalled();

        await user.click(save);
        expect(submit).toHaveBeenCalledOnce();
    } finally {
        form.remove();
    }
});

it.each(['a', '界', '😀'])('enforces the 255-character boundary for %s', async (character) => {
    const user = userEvent.setup();
    render(EnumElements);
    const input = screen.getByRole('textbox', { name: 'Elements' });
    await user.click(input);
    await user.paste(character.repeat(256));
    expect(input).toBeInvalid();
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Enum elements cannot exceed 255 characters.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Remove / })).not.toBeInTheDocument();
    expect(input).toBeInvalid();

    await user.clear(input);
    await user.paste(character.repeat(255));
    expect(input).toBeValid();
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(1);
    expect(input).toBeValid();
    expect(
        screen.queryByText('Enum elements cannot exceed 255 characters.')
    ).not.toBeInTheDocument();
});

it('applies native length validation to the trimmed value', async () => {
    const user = userEvent.setup();
    render(EnumElements);
    const input = screen.getByRole('textbox', { name: 'Elements' });
    await user.click(input);
    await user.paste(`  ${'界'.repeat(255)}  `);

    expect(input).toBeValid();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: /^Remove / })).toHaveAttribute(
        'aria-label',
        `Remove ${'界'.repeat(255)}`
    );
});

it('rejects whitespace-only elements and trims only outside the value', async () => {
    const user = userEvent.setup();
    render(EnumElements);
    const input = screen.getByRole('textbox', { name: 'Elements' });

    await user.type(input, '   {Enter}');

    expect(screen.queryByRole('button', { name: /^Remove / })).not.toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(input).toBeRequired();
    expect(input).toBeInvalid();

    await user.type(input, '  New  York  {Enter}');

    expect(screen.getByRole('button', { name: 'Remove New York' })).toHaveAttribute(
        'aria-label',
        'Remove New  York'
    );
    expect(input).not.toBeRequired();
    expect(input).toBeValid();
});

it('ignores exact duplicates while preserving case-sensitive enum values', async () => {
    const user = userEvent.setup();
    render(EnumElements, { elements: ['Home'] });
    const input = screen.getByRole('textbox', { name: /^Elements/ });

    await user.type(input, 'Home{Enter}home{Enter}');

    expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Remove Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove home' })).toBeInTheDocument();
    expect(input).toHaveValue('');
});

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
