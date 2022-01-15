import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/svelte';

import { Button } from '../../../src/lib/components';

test('shows button', () => {
	const { getByRole } = render(Button);

	expect(getByRole('button')).toBeInTheDocument();
});

test('shows button - disabled', () => {
	const { getByRole } = render(Button, { disabled: true });

	expect(getByRole('button')).toBeDisabled();
});

test('shows button - submit', () => {
	const { getByRole } = render(Button, { submit: true });

	expect(getByRole('button')).toHaveAttribute('type', 'submit');
});

test('shows button - outline', () => {
	const { getByRole } = render(Button, { outline: true });

	expect(getByRole('button')).toHaveClass('outline');
});

test('shows button - contrast', () => {
	const { getByRole } = render(Button, { contrast: true });

	expect(getByRole('button')).toHaveClass('contrast');
});

test('shows button - secondary', () => {
	const { getByRole } = render(Button, { secondary: true });

	expect(getByRole('button')).toHaveClass('secondary');
});

test('shows button - on:click', async () => {
	const { getByRole, component } = render(Button);
	const button = getByRole('button');
	const callback = jest.fn();
	component.$on('click', callback);

	await fireEvent.click(button);
	expect(callback).toHaveBeenCalled();
});
