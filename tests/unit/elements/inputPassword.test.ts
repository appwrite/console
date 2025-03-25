import { expect, test } from 'vitest';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputPassword } from '../../../src/lib/elements/forms';

test('shows password input', () => {
    const { getByText, getByLabelText } = render(InputPassword, { id: 'input', label: 'input' });
    const input = getByLabelText('input');

    expect(getByText('input')).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');
});

test('shows password input - required', () => {
    const { getByLabelText } = render(InputPassword, {
        id: 'input',
        label: 'input',
        required: true
    });

    expect(getByLabelText('input')).toBeRequired();
});

test('shows password input - disabled', () => {
    const { getByLabelText } = render(InputPassword, {
        id: 'input',
        label: 'input',
        disabled: true
    });

    expect(getByLabelText('input')).toBeDisabled();
});

test('shows password input - autofocus', () => {
    const { getByLabelText } = render(InputPassword, {
        id: 'input',
        label: 'input',
        autofocus: true
    });

    expect(getByLabelText('input')).toHaveFocus();
});

test('shows password input - placeholder', () => {
    const { getByPlaceholderText } = render(InputPassword, {
        id: 'input',
        label: 'input',
        placeholder: 'find me'
    });

    expect(getByPlaceholderText('find me')).toBeInTheDocument();
});

test('shows password input - meter', () => {
    render(InputPassword, {
        id: 'input',
        label: 'input'
    });

    const meter = document.querySelector('meter');
    expect(meter).toBeInTheDocument();
});

test('shows password input - show password button', () => {
    const { getByRole } = render(InputPassword, {
        id: 'input',
        label: 'input'
    });

    expect(getByRole('button')).toBeInTheDocument();
});

test('shows password input - maxlength', () => {
    const { getByLabelText } = render(InputPassword, {
        id: 'input',
        label: 'input',
        maxlength: 2
    });

    expect(getByLabelText('input')).toHaveAttribute('maxlength', '2');
});
test('shows password input - minlength', () => {
    const { getByLabelText } = render(InputPassword, {
        id: 'input',
        label: 'input',
        minlength: 2
    });

    expect(getByLabelText('input')).toHaveAttribute('minlength', '2');
});

test('shows password input - hide label', () => {
    render(InputPassword, {
        id: 'input',
        label: 'label'
    });

    const label = document.querySelector('label');
    expect(label).toHaveClass('u-hide');
});

test('state', async () => {
    const { component, getByLabelText } = render(InputPassword, {
        id: 'input',
        label: 'input',
        value: ''
    });
    const input = getByLabelText('input');

    expect(component.value).toEqual('');
    await userEvent.type(input, 'lorem');
    expect(component.value).toEqual('lorem');
});
