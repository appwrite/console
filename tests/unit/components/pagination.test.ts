import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/svelte';
import { Pagination } from '../../../src/lib/components';

test('shows controls', () => {
	const { getByText } = render(Pagination, {
		limit: 0,
		offset: 0,
		sum: 100
	});

	expect(getByText('<')).toBeInTheDocument();
	expect(getByText('>')).toBeInTheDocument();
});

test('pagination - first page', () => {
	const { getByText } = render(Pagination, {
		limit: 25,
		offset: 0,
		sum: 100
	});

	expect(getByText('<')).toBeDisabled();
	expect(getByText('>')).not.toBeDisabled();
});

test('pagination - last page', () => {
	const { getByText } = render(Pagination, {
		limit: 25,
		offset: 25,
		sum: 30
	});

	expect(getByText('<')).not.toBeDisabled();
	expect(getByText('>')).toBeDisabled();
});

test('pagination - forward', async () => {
	const { getByText, component } = render(Pagination, {
		limit: 25,
		offset: 0,
		sum: 60
	});

	const back = getByText('<');
	const forth = getByText('>');
	expect(back).toBeDisabled();

	await fireEvent.click(forth);
	expect(component.offset).toEqual(25);

	await fireEvent.click(forth);
	expect(component.offset).toEqual(50);

	await fireEvent.click(forth);
	expect(component.offset).toEqual(60);
	expect(forth).toBeDisabled();
});

test('pagination - backwards', async () => {
	const { getByText, component } = render(Pagination, {
		limit: 25,
		offset: 55,
		sum: 60
	});

	const back = getByText('<');
	const forth = getByText('>');
	expect(forth).toBeDisabled();

	await fireEvent.click(back);
	expect(component.offset).toEqual(30);

	await fireEvent.click(back);
	expect(component.offset).toEqual(5);

	await fireEvent.click(back);
	expect(component.offset).toEqual(0);
	expect(back).toBeDisabled();
});

test('shows no controls', () => {
	const { queryByText } = render(Pagination, {
		limit: 25,
		offset: 0,
		sum: 10
	});

	expect(queryByText('<')).not.toBeInTheDocument();
	expect(queryByText('>')).not.toBeInTheDocument();
});
