import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputText } from '../../../src/lib/elements/forms';

test('shows text input', () => {
	const { getByText, getByLabelText } = render(InputText, { label: 'input' });
	const input = getByLabelText('input');

	expect(getByText('input')).toBeInTheDocument();
	expect(input).toBeInTheDocument();
	expect(input).toHaveAttribute('type', 'text');
});

test('shows text input - required', () => {
	const { getByLabelText } = render(InputText, { label: 'input', required: true });

	expect(getByLabelText('input')).toBeRequired();
});

test('shows text input - disabled', () => {
	const { getByLabelText } = render(InputText, { label: 'input', disabled: true });

	expect(getByLabelText('input')).toBeDisabled();
});

test('shows text input - autofocus', () => {
	const { getByLabelText } = render(InputText, { label: 'input', autofocus: true });

	expect(getByLabelText('input')).toHaveFocus();
});

test('shows text input - placeholder', () => {
	const { getByPlaceholderText } = render(InputText, { label: 'input', placeholder: 'find me' });

	expect(getByPlaceholderText('find me')).toBeInTheDocument();
});

test('state', async () => {
	const { component, getByLabelText } = render(InputText, { label: 'input', value: '' });
	const input = getByLabelText('input');

	expect(component.value).toEqual('');
	await userEvent.type(input, 'lorem');
	expect(component.value).toEqual('lorem');
});
