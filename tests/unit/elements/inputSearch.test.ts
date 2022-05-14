import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputSearch } from '../../../src/lib/elements/forms';

test('shows search input', () => {
    const { getByPlaceholderText } = render(InputSearch, { placeholder: 'search' });

    expect(getByPlaceholderText('search')).toBeInTheDocument();
    expect(getByPlaceholderText('search')).toHaveAttribute('type', 'search');
});

test('shows input search - required', () => {
    const { getByPlaceholderText } = render(InputSearch, { placeholder: 'search', required: true });

    expect(getByPlaceholderText('search')).toBeRequired();
});

test('shows input search - disabled', () => {
    const { getByPlaceholderText } = render(InputSearch, { placeholder: 'search', disabled: true });

    expect(getByPlaceholderText('search')).toBeDisabled();
});

test('shows input search - autofocus', () => {
    const { getByPlaceholderText } = render(InputSearch, {
        placeholder: 'search',
        autofocus: true
    });

    expect(getByPlaceholderText('search')).toHaveFocus();
});

test('shows input search - placeholder', () => {
    const { getByPlaceholderText } = render(InputSearch, {
        placeholder: 'find me'
    });

    expect(getByPlaceholderText('find me')).toBeInTheDocument();
});

test('state change after debounce', async () => {
    const debounce = 250;
    const { component, getByPlaceholderText } = render(InputSearch, {
        placeholder: 'search',
        value: '',
        debounce
    });
    const input = getByPlaceholderText('search');

    expect(component.value).toEqual('');
    await userEvent.type(input, 'lorem');
    expect(component.value).not.toEqual('lorem');
    setTimeout(() => {
        expect(component.value).toEqual('lorem');
    }, debounce);
});
