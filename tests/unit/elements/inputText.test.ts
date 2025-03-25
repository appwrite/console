import { expect, test } from 'vitest';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputText } from '../../../src/lib/elements/forms';
import { tick } from 'svelte';

test('shows text input', () => {
    const { getByText, getByLabelText } = render(InputText, { id: 'input', label: 'input' });
    const input = getByLabelText('input');

    expect(getByText('input')).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
});

test('shows text input - required', () => {
    const { getByLabelText } = render(InputText, { id: 'input', label: 'input', required: true });

    expect(getByLabelText('input')).toBeRequired();
});

test('shows text input - disabled', () => {
    const { getByLabelText } = render(InputText, { id: 'input', label: 'input', disabled: true });

    expect(getByLabelText('input')).toBeDisabled();
});

test('shows text input - autofocus', async () => {
    const { getByLabelText } = render(InputText, { id: 'input', label: 'input', autofocus: true });
    await tick();
    expect(getByLabelText('input')).toHaveFocus();
});

test('shows text input - placeholder', () => {
    const { getByPlaceholderText } = render(InputText, {
        id: 'input',
        label: 'input',
        placeholder: 'find me'
    });

    expect(getByPlaceholderText('find me')).toBeInTheDocument();
});

test('shows text input - hide label', () => {
    render(InputText, {
        id: 'input',
        label: 'label'
    });

    const label = document.querySelector('label');
    expect(label).toHaveClass('u-hide');
});

test('shows text input - autocomplete', () => {
    const { getByLabelText } = render(InputText, {
        id: 'input',
        label: 'input',
        autocomplete: true
    });

    expect(getByLabelText('input')).toHaveAttribute('autocomplete', 'on');
});

test('shows text input - maxlength', () => {
    const { getByLabelText } = render(InputText, {
        id: 'input',
        label: 'input',
        maxlength: 2
    });

    expect(getByLabelText('input')).toHaveAttribute('maxlength', '2');
});

test('state', async () => {
    const { component, container } = render(InputText, {
        id: 'input',
        label: 'input',
        value: ''
    });

    const input = container.querySelector('input');
    expect(component.value).toEqual('');
    await userEvent.type(input, 'lorem');
    expect(component.value).toEqual('lorem');
});
