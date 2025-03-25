import { expect, test } from 'vitest';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputSelect } from '../../../src/lib/elements/forms';

const options = [
    { value: '', label: 'None' },
    { value: '1', label: 'One' },
    { value: '2', label: 'Two' },
    { value: '3', label: 'Three' }
];

test('shows select input', () => {
    const { getByText, getByLabelText } = render(InputSelect, {
        id: 'select',
        label: 'select',
        value: '',
        options
    });
    const select = getByLabelText('select');

    expect(getByText('select')).toBeInTheDocument();
    expect(select).toBeInTheDocument();
});

test('shows options', () => {
    const { getByText } = render(InputSelect, {
        id: 'select',
        label: 'select',
        value: '',
        options
    });

    options.forEach((option) => {
        expect(getByText(option.label)).toBeInTheDocument();
    });
});

test('shows placeholder', () => {
    const { getByText } = render(InputSelect, {
        id: 'select',
        label: 'select',
        value: '',
        placeholder: 'placeholder',
        options
    });

    expect(getByText('placeholder')).toBeInTheDocument();
});

test('shows select input - required', () => {
    const { getByLabelText } = render(InputSelect, {
        id: 'select',
        label: 'select',
        value: '',
        required: true,
        options
    });

    expect(getByLabelText('select')).toBeRequired();
});

test('shows select input - disabled', () => {
    const { getByLabelText } = render(InputSelect, {
        id: 'select',
        label: 'select',
        value: '',
        disabled: true,
        options
    });

    expect(getByLabelText('select')).toBeDisabled();
});

test('shows select input - hide label', () => {
    render(InputSelect, {
        id: 'select',
        value: '',
        label: 'label',
        options
    });

    const label = document.querySelector('label');
    expect(label).toHaveClass('u-hide');
});

test('state', async () => {
    const { component, getByLabelText } = render(InputSelect, {
        id: 'select',
        label: 'select',
        value: '',
        options
    });
    const select = getByLabelText('select');

    expect(component.value).toEqual('');

    await userEvent.selectOptions(select, '1');
    expect(component.value).toEqual(options[1].value);

    await userEvent.selectOptions(select, '2');
    expect(component.value).toEqual(options[2].value);
});
