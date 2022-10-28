import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import BreadcrumbsComponent from '../../../src/lib/layout/breadcrumbs.svelte';

test('shows relevant breadcrumbs', async () => {
    const { queryByText } = render(BreadcrumbsComponent, {
        breadcrumbs: [
            {
                href: '/lorem',
                title: 'First'
            },
            {
                href: '/ipsum',
                title: 'Second'
            }
        ]
    });

    expect(queryByText('First')).toBeInTheDocument();
    expect(queryByText('First')).toHaveAccessibleName();
    expect(queryByText('First')).toHaveAttribute('href', '/lorem');
    expect(queryByText('Second')).toBeInTheDocument();
    expect(queryByText('Second')).toHaveAccessibleName();
    expect(queryByText('Second')).toHaveAttribute('href', '/ipsum');
});
