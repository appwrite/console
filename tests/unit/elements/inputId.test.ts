import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputId } from '../../../src/lib/elements/forms';

test('shows id input', () => {
    const { getByPlaceholderText } = render(InputId);
    const input = getByPlaceholderText('Enter ID');

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
});

test('state', async () => {
    const { component, getByPlaceholderText } = render(InputId, { value: '' });
    const input = getByPlaceholderText('Enter ID');

    console.log(component);
    expect(component.value).toEqual('');
    await userEvent.type(input, 'lorem');
    expect(component.value).toEqual('lorem');
});
