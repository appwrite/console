import { expect, test } from 'vitest';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputURL } from '../../../src/lib/elements/forms';

test('shows URL input', () => {
    const { getByText, getByLabelText } = render(InputURL, { id: 'input', label: 'input' });
    const input = getByLabelText('input');

    expect(getByText('input')).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'url');
});

test('shows URL input - required', () => {
    const { getByLabelText } = render(InputURL, { id: 'input', label: 'input', required: true });

    expect(getByLabelText('input')).toBeRequired();
});

test('shows URL input - disabled', () => {
    const { getByLabelText } = render(InputURL, { id: 'input', label: 'input', disabled: true });

    expect(getByLabelText('input')).toBeDisabled();
});

test('shows URL input - autofocus', () => {
    const { getByLabelText } = render(InputURL, { id: 'input', label: 'input', autofocus: true });

    expect(getByLabelText('input')).toHaveFocus();
});

test('shows URL input - placeholder', () => {
    const { getByPlaceholderText } = render(InputURL, {
        id: 'input',
        label: 'input',
        placeholder: 'find me'
    });

    expect(getByPlaceholderText('find me')).toBeInTheDocument();
});

test('shows URL input - hide label', () => {
    render(InputURL, {
        id: 'input',
        label: 'label'
    });

    const label = document.querySelector('label');
    expect(label).toHaveClass('u-hide');
});

test('shows URL input - autocomplete', () => {
    const { getByLabelText } = render(InputURL, {
        id: 'input',
        label: 'input',
        autocomplete: true
    });

    expect(getByLabelText('input')).toHaveAttribute('autocomplete', 'on');
});

test('shows URL input - maxlength', () => {
    const { getByLabelText } = render(InputURL, {
        id: 'input',
        label: 'input',
        maxlength: 2
    });

    expect(getByLabelText('input')).toHaveAttribute('maxlength', '2');
});

test('state', async () => {
    const { component, getByLabelText } = render(InputURL, {
        id: 'input',
        label: 'input',
        value: ''
    });
    const input = getByLabelText('input');

    expect(component.value).toEqual('');
    await userEvent.type(input, 'lorem');
    expect(component.value).toEqual('lorem');
});
