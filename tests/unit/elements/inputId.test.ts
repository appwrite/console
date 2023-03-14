import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputId } from '../../../src/lib/elements/forms';

const validStrings = ['valid_string', 'valid-string', 'valid.string', 'validstring123', 'valid_'];

const invalidStrings = ['-invalid', '.invalid', '_invalid'];

test('shows id input', () => {
    const { getByPlaceholderText } = render(InputId);
    const input = getByPlaceholderText('Enter ID');

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
});

test('state', async () => {
    const { component, getByPlaceholderText } = render(InputId, { value: '' });
    const input = getByPlaceholderText('Enter ID');

    expect(component.value).toEqual('');
    await userEvent.type(input, 'lorem');
    expect(component.value).toEqual('lorem');
});

validStrings.forEach((validString) => {
    test(`validates ${validString} as valid`, () => {
        const { getByPlaceholderText } = render(InputId, { value: validString });
        const input = getByPlaceholderText('Enter ID') as HTMLInputElement;
        expect(input.checkValidity()).toBe(true);
    });
});
invalidStrings.forEach((invalidString) => {
    test(`validates ${invalidString} as invalid`, () => {
        const { getByPlaceholderText } = render(InputId, { value: invalidString });
        const input = getByPlaceholderText('Enter ID') as HTMLInputElement;
        expect(input.checkValidity()).toBe(false);
    });
});
