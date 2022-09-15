import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import BreadcrumbsComponent from '../../../src/lib/layout/Breadcrumbs.svelte';
import { level, updateLayout } from '../../../src/lib/stores/layout';
import { tick } from 'svelte';

test('shows relevant breadcrumbs', async () => {
    const { queryByText } = render(BreadcrumbsComponent);

    updateLayout({
        title: 'Test',
        level: 3,
        breadcrumbs: [
            {
                href: 'lorem',
                title: 'First',
                level: 1
            },
            {
                href: 'ipsum',
                title: 'Second',
                level: 2
            },
            {
                href: 'dolor/sit/amet',
                title: 'Third'
            }
        ]
    });

    level.set(2);
    await tick();
    expect(queryByText('First')).toBeInTheDocument();
    expect(queryByText('First')).toHaveAccessibleName();
    expect(queryByText('First')).toHaveAttribute('href', '/lorem');
    expect(queryByText('Second')).toBeInTheDocument();
    expect(queryByText('Second')).toHaveAccessibleName();
    expect(queryByText('Second')).toHaveAttribute('href', '/lorem/ipsum');
    expect(queryByText('Third')).not.toBeInTheDocument();

    level.set(1);
    await tick();
    expect(queryByText('First')).toBeInTheDocument();
    expect(queryByText('First')).toHaveAccessibleName();
    expect(queryByText('First')).toHaveAttribute('href', '/lorem');
    expect(queryByText('Second')).not.toBeInTheDocument();

    level.set(0);
    await tick();
    expect(queryByText('First')).not.toBeInTheDocument();
    expect(queryByText('Second')).not.toBeInTheDocument();

    level.set(3);
    await tick();
    expect(queryByText('First')).toBeInTheDocument();
    expect(queryByText('First')).toHaveAccessibleName();
    expect(queryByText('First')).toHaveAttribute('href', '/lorem');
    expect(queryByText('Second')).toBeInTheDocument();
    expect(queryByText('Second')).toHaveAccessibleName();
    expect(queryByText('Second')).toHaveAttribute('href', '/lorem/ipsum');
    expect(queryByText('Third')).toBeInTheDocument();
    expect(queryByText('Third')).toHaveAccessibleName();
    expect(queryByText('Third')).toHaveAttribute('href', '/lorem/ipsum/dolor/sit/amet');
});

test('shows relevant breadcrumbs and ignore order', async () => {
    const { queryByText } = render(BreadcrumbsComponent);

    updateLayout({
        title: 'Test',
        level: 3,
        breadcrumbs: [
            {
                href: 'ipsum',
                title: 'Second',
                level: 2
            },
            {
                href: 'lorem',
                title: 'First',
                level: 1
            },
            {
                href: 'dolor/sit/amet',
                title: 'Third'
            }
        ]
    });

    level.set(2);
    await tick();
    expect(queryByText('First')).toBeInTheDocument();
    expect(queryByText('First')).toHaveAccessibleName();
    expect(queryByText('First')).toHaveAttribute('href', '/lorem');
    expect(queryByText('Second')).toBeInTheDocument();
    expect(queryByText('Second')).toHaveAccessibleName();
    expect(queryByText('Second')).toHaveAttribute('href', '/lorem/ipsum');
    expect(queryByText('Third')).not.toBeInTheDocument();

    level.set(1);
    await tick();
    expect(queryByText('First')).toBeInTheDocument();
    expect(queryByText('First')).toHaveAccessibleName();
    expect(queryByText('First')).toHaveAttribute('href', '/lorem');
    expect(queryByText('Second')).not.toBeInTheDocument();

    level.set(0);
    await tick();
    expect(queryByText('First')).not.toBeInTheDocument();
    expect(queryByText('Second')).not.toBeInTheDocument();

    level.set(3);
    await tick();
    expect(queryByText('First')).toBeInTheDocument();
    expect(queryByText('First')).toHaveAccessibleName();
    expect(queryByText('First')).toHaveAttribute('href', '/lorem');
    expect(queryByText('Second')).toBeInTheDocument();
    expect(queryByText('Second')).toHaveAccessibleName();
    expect(queryByText('Second')).toHaveAttribute('href', '/lorem/ipsum');
    expect(queryByText('Third')).toBeInTheDocument();
    expect(queryByText('Third')).toHaveAccessibleName();
    expect(queryByText('Third')).toHaveAttribute('href', '/lorem/ipsum/dolor/sit/amet');
});
