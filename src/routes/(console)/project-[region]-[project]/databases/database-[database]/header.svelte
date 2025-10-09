<script lang="ts">
    import { page } from '$app/state';
    import { Cover, CoverTitle } from '$lib/layout';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { canWriteDatabases } from '$lib/stores/roles';
    import { resolveRoute, withPath } from '$lib/stores/navigation';
    import { useTerminology } from '$database/(entity)';

    const database = $derived(page.data.database);
    const terminology = $derived(useTerminology(page));

    const baseDatabasesPath = $derived(
        resolveRoute('/(console)/project-[region]-[project]/databases', page.params)
    );

    const baseDatabasePath = $derived(
        resolveRoute(
            '/(console)/project-[region]-[project]/databases/database-[database]',
            page.params
        )
    );

    const tabs = $derived(
        [
            {
                href: baseDatabasePath,
                title: terminology.entity.title.plural,
                event: terminology.entity.lower.plural,
                hasChildren: true
            },
            {
                href: withPath(baseDatabasePath, '/backups'),
                title: 'Backups',
                event: 'backups',
                hasChildren: true
            },
            {
                href: withPath(baseDatabasePath, '/usage'),
                title: 'Usage',
                event: 'usage',
                hasChildren: true
            },
            {
                href: withPath(baseDatabasePath, '/settings'),
                event: 'settings',
                title: 'Settings',
                disabled: !$canWriteDatabases
            }
        ].filter((tab) => !tab.disabled)
    );
</script>

<Cover databasesMainScreen>
    <svelte:fragment slot="header">
        <CoverTitle href={baseDatabasesPath} style="margin-inline-start: -2.5rem;">
            {database?.name}
        </CoverTitle>

        <Id value={database?.$id}>{database?.$id}</Id>
    </svelte:fragment>

    <Tabs>
        {#each tabs as tab}
            <Tab
                href={tab.href}
                event={tab.event}
                selected={isTabSelected(tab, page.url.pathname, baseDatabasePath, tabs)}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
