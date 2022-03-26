import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/svelte';
import { Pagination } from '../../../src/lib/components';

test('shows controls', () => {
    const { getByLabelText } = render(Pagination, {
        limit: 0,
        offset: 0,
        sum: 100
    });
    expect(getByLabelText('previous page')).toBeInTheDocument();
    expect(getByLabelText('next page')).toBeInTheDocument();
});

test('pagination - first page', () => {
    const { getByLabelText } = render(Pagination, {
        limit: 25,
        offset: 0,
        sum: 100
    });

    expect(getByLabelText('previous page')).toBeDisabled();
    expect(getByLabelText('next page')).not.toBeDisabled();
});

test('pagination - last page', () => {
    const { getByLabelText } = render(Pagination, {
        limit: 25,
        offset: 25,
        sum: 30
    });

    expect(getByLabelText('previous page')).not.toBeDisabled();
    expect(getByLabelText('next page')).toBeDisabled();
});

test('pagination - forward', async () => {
    const { getByLabelText, component } = render(Pagination, {
        limit: 25,
        offset: 0,
        sum: 60
    });

    const back = getByLabelText('previous page');
    const forth = getByLabelText('next page');
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
    const { getByLabelText, component } = render(Pagination, {
        limit: 25,
        offset: 55,
        sum: 60
    });

    const back = getByLabelText('previous page');
    const forth = getByLabelText('next page');
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
    const { queryByLabelText } = render(Pagination, {
        limit: 25,
        offset: 0,
        sum: 10
    });

    expect(queryByLabelText('previous page')).not.toBeInTheDocument();
    expect(queryByLabelText('next page')).not.toBeInTheDocument();
});
