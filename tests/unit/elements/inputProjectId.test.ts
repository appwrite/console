import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputProjectId } from '../../../src/lib/elements/forms';

const validStrings = ['validstring', 'valid-string', 'validstring123', 'valid-'];

const invalidStrings = ['-invalid', 'Valid', '_invalid', 'Valid123', 'valid.string'];

test('shows id input', () => {
    const { getByPlaceholderText } = render(InputProjectId);
    const input = getByPlaceholderText('Enter ID');

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
});

test('state', async () => {
    const { component, getByPlaceholderText } = render(InputProjectId, { value: '' });
    const input = getByPlaceholderText('Enter ID');

    expect(component.value).toEqual('');
    await userEvent.type(input, 'lorem');
    expect(component.value).toEqual('lorem');
});

validStrings.forEach((validString) => {
    test(`validates ${validString} as valid`, () => {
        const { getByPlaceholderText } = render(InputProjectId, { value: validString });
        const input = getByPlaceholderText('Enter ID') as HTMLInputElement;
        expect(input.checkValidity()).toBe(true);
    });
});
invalidStrings.forEach((invalidString) => {
    test(`validates ${invalidString} as invalid`, () => {
        const { getByPlaceholderText } = render(InputProjectId, { value: invalidString });
        const input = getByPlaceholderText('Enter ID') as HTMLInputElement;
        expect(input.checkValidity()).toBe(false);
    });
});