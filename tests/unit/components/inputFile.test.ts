import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import { InputFile } from '../../../src/lib/components';

test('shows file input', () => {
	const { getByText, getByLabelText } = render(InputFile, { label: 'input', files: null });
	const input = getByLabelText('input');

	expect(getByText('input')).toBeInTheDocument();
	expect(input).toBeInTheDocument();
	expect(input).toHaveAttribute('type', 'file');
});

test('shows file input - required', () => {
	const { getByLabelText } = render(InputFile, { label: 'input', required: true, files: null });

	expect(getByLabelText('input')).toBeRequired();
});

test('shows file input - disabled', () => {
	const { getByLabelText } = render(InputFile, { label: 'input', disabled: true, files: null });

	expect(getByLabelText('input')).toBeDisabled();
});
