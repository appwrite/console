import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/svelte';
import { InputRadio } from '../../../src/lib/elements/forms';
import radioGroup from './radioGroup.test.svelte';

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

test('state', async () => {
    const { getByLabelText } = render(radioGroup);

    const one = getByLabelText('one');
    const two = getByLabelText('two');
    const three = getByLabelText('three');

    await fireEvent.click(one);
    expect(one).toBeChecked();
    expect(two).not.toBeChecked();
    expect(three).not.toBeChecked();

    await fireEvent.click(two);
    expect(one).not.toBeChecked();
    expect(two).toBeChecked();
    expect(three).not.toBeChecked();

    await fireEvent.click(three);
    expect(one).not.toBeChecked();
    expect(two).not.toBeChecked();
    expect(three).toBeChecked();
});
