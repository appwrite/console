import { expect, test } from 'vitest';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputEmail } from '../../../src/lib/elements/forms';

test('shows email input', () => {
    const { getByText, getByLabelText } = render(InputEmail, { id: 'input', label: 'input' });
    const input = getByLabelText('input');

    expect(getByText('input')).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
});

test('shows email input - required', () => {
    const { getByLabelText } = render(InputEmail, { id: 'input', label: 'input', required: true });

    expect(getByLabelText('input')).toBeRequired();
});

test('shows email input - disabled', () => {
    const { getByLabelText } = render(InputEmail, { id: 'input', label: 'input', disabled: true });

    expect(getByLabelText('input')).toBeDisabled();
});

test('shows email input - autofocus', () => {
    const { getByLabelText } = render(InputEmail, { id: 'input', label: 'input', autofocus: true });

    expect(getByLabelText('input')).toHaveFocus();
});

test('shows email input - placeholder', () => {
    const { getByPlaceholderText } = render(InputEmail, {
        id: 'input',
        label: 'input',
        placeholder: 'find me'
    });

    expect(getByPlaceholderText('find me')).toBeInTheDocument();
});

test('shows email input - hide label', () => {
    render(InputEmail, {
        id: 'input',
        label: 'label'
    });

    const label = document.querySelector('label');
    expect(label).toHaveClass('u-hide');
});

test('shows email input - autocomplete', () => {
    const { getByLabelText } = render(InputEmail, {
        id: 'input',
        label: 'input',
        autocomplete: true
    });

    expect(getByLabelText('input')).toHaveAttribute('autocomplete', 'on');
});

test('state', async () => {
    const { component, getByLabelText } = render(InputEmail, {
        id: 'input',
        label: 'input',
        value: ''
    });
    const input = getByLabelText('input');

    expect(component.value).toEqual('');
    await userEvent.type(input, 'lorem');
    expect(component.value).toEqual('lorem');
});
