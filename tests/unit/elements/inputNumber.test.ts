import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputNumber } from '../../../src/lib/elements/forms';

test('shows number input', () => {
	const { getByText, getByLabelText } = render(InputNumber, { label: 'input' });
	const input = getByLabelText('input');

	expect(getByText('input')).toBeInTheDocument();
	expect(input).toBeInTheDocument();
	expect(input).toHaveAttribute('type', 'number');
});

test('shows number input - required', () => {
	const { getByLabelText } = render(InputNumber, { label: 'input', required: true });

	expect(getByLabelText('input')).toBeRequired();
});

test('shows number input - disabled', () => {
	const { getByLabelText } = render(InputNumber, { label: 'input', disabled: true });

	expect(getByLabelText('input')).toBeDisabled();
});

test('shows number input - autofocus', () => {
	const { getByLabelText } = render(InputNumber, { label: 'input', autofocus: true });

	expect(getByLabelText('input')).toHaveFocus();
});

test('shows number input - placeholder', () => {
	const { getByPlaceholderText } = render(InputNumber, { label: 'input', placeholder: 'find me' });

	expect(getByPlaceholderText('find me')).toBeInTheDocument();
});

test('state', async () => {
	const { component, getByLabelText } = render(InputNumber, { label: 'input' });
	const input = getByLabelText('input');

	expect(component.value).toEqual(null);
	await userEvent.type(input, '123');
	expect(component.value).toEqual(123);
});
