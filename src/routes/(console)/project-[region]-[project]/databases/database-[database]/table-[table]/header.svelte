<script lang="ts">
    import { page } from '$app/state';
    import { canWriteTables } from '$lib/stores/roles';
    import { resolveRoute } from '$lib/stores/navigation';

    import { type Entity, Header } from '$database/(entity)';

    const path = $derived(
        resolveRoute(
            '/(console)/project-[region]-[project]/databases/database-[database]/table-[table]',
            page.params
        )
    );

    const link = $derived(
        resolveRoute(
            '/(console)/project-[region]-[project]/databases/database-[database]',
            page.params
        )
    );

    const table = $derived(page.data.table) as Entity;

    const tabs = $derived(
        [
            {
                href: path,
                title: 'Rows',
                event: 'rows',
                hasChildren: true
            },
            {
                href: `${path}/columns`,
                title: 'Columns',
                event: 'columns'
            },
            {
                href: `${path}/indexes`,
                title: 'Indexes',
                event: 'indexes'
            },
            {
                href: `${path}/activity`,
                title: 'Activity',
                event: 'activity',
                hasChildren: true
            },
            {
                href: `${path}/usage`,
                title: 'Usage',
                event: 'usage',
                hasChildren: true
            },
            {
                href: `${path}/settings`,
                title: 'Settings',
                event: 'settings',
                disabled: !$canWriteTables
            }
        ].filter((tab) => !tab.disabled)
    );
</script>

<Header {tabs} entity={table} parentHref={link} />
