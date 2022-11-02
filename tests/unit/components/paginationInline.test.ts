import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/svelte';
import { PaginationInline } from '../../../src/lib/components';

test('shows controls', () => {
    const { getByLabelText } = render(PaginationInline, {
        limit: 100,
        offset: 0,
        sum: 150
    });
    expect(getByLabelText('prev page')).toBeInTheDocument();
    expect(getByLabelText('next page')).toBeInTheDocument();
});

test('pagination - first page', () => {
    const { getByLabelText } = render(PaginationInline, {
        limit: 25,
        offset: 0,
        sum: 100
    });

    expect(getByLabelText('prev page')).toHaveClass('is-disabled');
    expect(getByLabelText('next page')).not.toHaveClass('is-disabled');
});

test('pagination - last page', () => {
    const { getByLabelText } = render(PaginationInline, {
        limit: 25,
        offset: 25,
        sum: 30
    });

    expect(getByLabelText('prev page')).not.toHaveClass('is-disabled');
    expect(getByLabelText('next page')).toHaveClass('is-disabled');
});

test('pagination - forward', async () => {
    const { getByLabelText, component } = render(PaginationInline, {
        limit: 25,
        offset: 0,
        sum: 60
    });

    const back = getByLabelText('prev page');
    const forth = getByLabelText('next page');
    expect(back).toHaveClass('is-disabled');

    await fireEvent.click(forth);
    expect(component.offset).toEqual(25);

    await fireEvent.click(forth);
    expect(component.offset).toEqual(50);

    await fireEvent.click(forth);
    expect(component.offset).toEqual(50);
    expect(forth).toHaveClass('is-disabled');
});

test('pagination - backwards', async () => {
    const { getByLabelText, component } = render(PaginationInline, {
        limit: 25,
        offset: 55,
        sum: 60
    });

    const back = getByLabelText('prev page');
    const forth = getByLabelText('next page');
    expect(forth).toHaveClass('is-disabled');

    await fireEvent.click(back);
    expect(component.offset).toEqual(25);

    await fireEvent.click(back);
    expect(component.offset).toEqual(0);

    await fireEvent.click(back);
    expect(component.offset).toEqual(0);
    expect(back).toHaveClass('is-disabled');
});

test('pagination - number button click', async () => {
    const { getByText, getAllByLabelText, component } = render(PaginationInline, {
        limit: 25,
        offset: 0,
        sum: 60
    });

    const buttons = getAllByLabelText('page');
    const [button1, button2, button3] = buttons;

    const one = getByText('1');
    const two = getByText('2');
    const three = getByText('3');
    expect(button1).toHaveClass('is-disabled');

    await fireEvent.click(two);
    expect(component.offset).toEqual(25);
    expect(button1).not.toHaveClass('is-disabled');
    expect(button2).toHaveClass('is-disabled');

    await fireEvent.click(three);
    expect(component.offset).toEqual(50);
    expect(button2).not.toHaveClass('is-disabled');
    expect(button3).toHaveClass('is-disabled');

    await fireEvent.click(one);
    expect(component.offset).toEqual(0);
    expect(button1).toHaveClass('is-disabled');
    expect(button3).not.toHaveClass('is-disabled');
});

test('shows no active controls', () => {
    const { queryByLabelText } = render(PaginationInline, {
        limit: 25,
        offset: 0,
        sum: 10
    });

    expect(queryByLabelText('prev page')).toHaveClass('is-disabled');
    expect(queryByLabelText('next page')).toHaveClass('is-disabled');
});
