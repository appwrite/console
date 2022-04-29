import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import { InputRadio } from '../../../src/lib/elements/forms';

const data = {
    id: 'radio',
    label: 'radio',
    group: 'radio',
    value: 'radio',
    name: 'radio'
};

test('shows label', () => {
    const { getByText } = render(InputRadio, { ...data });

    expect(getByText('radio')).toBeInTheDocument();
});

test('shows boolean input - required', () => {
    const { getByRole } = render(InputRadio, { ...data, required: true });

    expect(getByRole('radio')).toBeRequired();
});

test('shows boolean input - disabled', () => {
    const { getByRole } = render(InputRadio, { ...data, disabled: true });

    expect(getByRole('radio')).toBeDisabled();
});

//TODO: create group of radio inputs and test state
