import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputTextarea } from '../../../src/lib/elements/forms';

test('shows textarea', () => {
    const { getByText, getByLabelText } = render(InputTextarea, { id: 'input', label: 'input' });
    const input = getByLabelText('input');

    expect(getByText('input')).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
});

test('shows textarea - required', () => {
    const { getByLabelText } = render(InputTextarea, {
        id: 'input',
        label: 'input',
        required: true
    });

    expect(getByLabelText('input')).toBeRequired();
});

test('shows textarea - disabled', () => {
    const { getByLabelText } = render(InputTextarea, {
        id: 'input',
        label: 'input',
        disabled: true
    });

    expect(getByLabelText('input')).toBeDisabled();
});

test('shows textarea - autofocus', () => {
    const { getByLabelText } = render(InputTextarea, {
        id: 'input',
        label: 'input',
        autofocus: true
    });

    expect(getByLabelText('input')).toHaveFocus();
});

test('shows textarea - placeholder', () => {
    const { getByPlaceholderText } = render(InputTextarea, {
        id: 'input',
        label: 'input',
        placeholder: 'find me'
    });

    expect(getByPlaceholderText('find me')).toBeInTheDocument();
});

test('state', async () => {
    const { component, getByLabelText } = render(InputTextarea, {
        id: 'input',
        label: 'input',
        value: ''
    });
    const input = getByLabelText('input');

    expect(component.value).toEqual('');
    await userEvent.type(input, 'lorem');
    expect(component.value).toEqual('lorem');
});
