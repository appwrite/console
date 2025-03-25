import { expect, test } from 'vitest';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputPhone } from '../../../src/lib/elements/forms';

test('shows phone input', () => {
    const { getByText, getByLabelText } = render(InputPhone, { id: 'input', label: 'input' });
    const input = getByLabelText('input');

    expect(getByText('input')).toBeInTheDocument();
    expect(input).toBeInTheDocument();
});

test('shows phone input - required', () => {
    const { getByLabelText } = render(InputPhone, { id: 'input', label: 'input', required: true });

    expect(getByLabelText('input')).toBeRequired();
});

test('shows phone input - disabled', () => {
    const { getByLabelText } = render(InputPhone, { id: 'input', label: 'input', disabled: true });

    expect(getByLabelText('input')).toBeDisabled();
});

test('shows phone input - autofocus', () => {
    const { getByLabelText } = render(InputPhone, { id: 'input', label: 'input', autofocus: true });

    expect(getByLabelText('input')).toHaveFocus();
});

test('shows phone input - placeholder', () => {
    const { getByPlaceholderText } = render(InputPhone, {
        id: 'input',
        label: 'input',
        placeholder: 'find me'
    });

    expect(getByPlaceholderText('find me')).toBeInTheDocument();
});

test('shows phone input - hide label', () => {
    render(InputPhone, {
        id: 'input',
        label: 'label'
    });

    const label = document.querySelector('label');
    expect(label).toHaveClass('u-hide');
});

test('shows phone input - autocomplete', () => {
    const { getByLabelText } = render(InputPhone, {
        id: 'input',
        label: 'input',
        autocomplete: true
    });

    expect(getByLabelText('input')).toHaveAttribute('autocomplete', 'on');
});

test('shows phone input - maxlength', () => {
    const { getByLabelText } = render(InputPhone, {
        id: 'input',
        label: 'input',
        maxlength: 2
    });

    expect(getByLabelText('input')).toHaveAttribute('maxlength', '2');
});

test('state', async () => {
    const { component, getByLabelText } = render(InputPhone, {
        id: 'input',
        label: 'input',
        value: ''
    });
    const input = getByLabelText('input');

    expect(component.value).toEqual('');
    await userEvent.type(input, 'lorem');
    expect(component.value).toEqual('lorem');
});
