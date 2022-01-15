import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render, fireEvent } from '@testing-library/svelte';
import Modal from './modal.test.svelte';

test('shows modal', () => {
	const { queryByText, component } = render(Modal);

	expect(queryByText('Content')).not.toBeInTheDocument();

	component.show = true;
	expect(queryByText('Content')).toBeInTheDocument();

	component.show = false;
	expect(queryByText('Content')).not.toBeInTheDocument();
});

test('close modal by click', async () => {
	const { queryByText, component, getByTitle } = render(Modal, {
		show: true
	});

	expect(queryByText('Content')).toBeInTheDocument();
	await fireEvent.click(getByTitle('Close'));

	expect(queryByText('Content')).not.toBeInTheDocument();
	expect(component.show).toStrictEqual(false);
});

test('close modal by key', async () => {
	const { queryByText, component } = render(Modal, {
		show: true
	});

	expect(queryByText('Content')).toBeInTheDocument();

	await userEvent.keyboard('[Escape]');
	expect(queryByText('Content')).not.toBeInTheDocument();
	expect(component.show).toStrictEqual(false);
});
