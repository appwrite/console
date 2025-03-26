import { expect, test } from 'vitest';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputDomain } from '../../../src/lib/elements/forms';

const validStrings = ['example.com', 'i-need.travelersinsurance', 'sub.domain.com'];
const invalidStrings = ['not-a-domain', 'tld-too-short.a', 'tld-too-long.overeighteencharacters'];

test('shows domain input', () => {
    const { getByText, getByLabelText } = render(InputDomain, { id: 'input', label: 'input' });
    const input = getByLabelText('input');

    expect(getByText('input')).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
});

test('shows domain input - required', () => {
    const { getByLabelText } = render(InputDomain, { id: 'input', label: 'input', required: true });

    expect(getByLabelText('input')).toBeRequired();
});

test('shows domain input - disabled', () => {
    const { getByLabelText } = render(InputDomain, { id: 'input', label: 'input', disabled: true });

    expect(getByLabelText('input')).toBeDisabled();
});

test('shows domain input - autofocus', () => {
    const { getByLabelText } = render(InputDomain, {
        id: 'input',
        label: 'input',
        autofocus: true
    });

    expect(getByLabelText('input')).toHaveFocus();
});

test('shows domain input - placeholder', () => {
    const { getByPlaceholderText } = render(InputDomain, {
        id: 'input',
        label: 'input',
        placeholder: 'find me'
    });

    expect(getByPlaceholderText('find me')).toBeInTheDocument();
});

test('shows domain input - hide label', () => {
    render(InputDomain, {
        id: 'input',
        label: 'label'
    });

    const label = document.querySelector('label');
    expect(label).toHaveClass('u-hide');
});

test('shows domain input - autocomplete', () => {
    const { getByLabelText } = render(InputDomain, {
        id: 'input',
        label: 'input',
        autocomplete: true
    });

    expect(getByLabelText('input')).toHaveAttribute('autocomplete', 'on');
});

test('shows domain input - maxlength', () => {
    const { getByLabelText } = render(InputDomain, {
        id: 'input',
        label: 'input',
        maxlength: 2
    });

    expect(getByLabelText('input')).toHaveAttribute('maxlength', '2');
});

test('state', async () => {
    const { component, getByLabelText } = render(InputDomain, {
        id: 'input',
        label: 'input',
        value: ''
    });
    const input = getByLabelText('input');

    expect(component.value).toEqual('');
    await userEvent.type(input, 'lorem');
    expect(component.value).toEqual('lorem');
});

validStrings.forEach((validString) => {
    test(`validates ${validString} as valid`, () => {
        const { getByLabelText } = render(InputDomain, {
            id: 'input',
            label: 'input',
            value: validString
        });
        const input = getByLabelText('input') as HTMLInputElement;
        expect(input.checkValidity()).toBe(true);
    });
});

invalidStrings.forEach((invalidString) => {
    // TODO: skipping because these pass in the browser but fail
    // in testing. It could be because of jsdom
    test.skip(`validates ${invalidString} as invalid`, () => {
        const { getByLabelText } = render(InputDomain, {
            id: 'input',
            label: 'input',
            value: invalidString
        });
        const input = getByLabelText('input') as HTMLInputElement;
        expect(input.checkValidity()).toBe(false);
    });
});
