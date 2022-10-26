import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import { Pagination } from '../../../src/lib/components';

test('shows controls', () => {
    const { getByLabelText } = render(Pagination, {
        limit: 100,
        offset: 0,
        sum: 150,
        path: ''
    });
    expect(getByLabelText('prev page')).toBeInTheDocument();
    expect(getByLabelText('next page')).toBeInTheDocument();
});

test('pagination - first page', () => {
    const { getByLabelText } = render(Pagination, {
        limit: 25,
        offset: 0,
        sum: 100,
        path: ''
    });

    expect(getByLabelText('prev page')).toHaveClass('is-disabled');
    expect(getByLabelText('next page')).not.toHaveClass('is-disabled');
});

test('pagination - last page', () => {
    const { getByLabelText } = render(Pagination, {
        limit: 25,
        offset: 25,
        sum: 30,
        path: ''
    });

    expect(getByLabelText('prev page')).not.toHaveClass('is-disabled');
    expect(getByLabelText('next page')).toHaveClass('is-disabled');
});
