<script lang="ts">
    import { page } from '$app/state';
    import { Cover, CoverTitle } from '$lib/layout';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { canWriteDatabases } from '$lib/stores/roles';
    import { resolveRoute, withPath } from '$lib/stores/navigation';
    import { useTerminology, type DatabaseType } from '$database/(entity)';
    import { isSmallViewport } from '$lib/stores/viewport';

    const terminology = useTerminology(page);
    const baseDatabasePath = resolveRoute(
        '/(console)/project-[region]-[project]/databases/database-[database]',
        page.params
    );

    const database = $derived(page.data.database);
    const baseDatabasesPath = resolveRoute(
        '/(console)/project-[region]-[project]/databases',
        page.params
    );

    // Check if this is a dedicated database type
    const isDedicatedType = $derived(
        (database?.type as DatabaseType) === 'prisma' ||
            (database?.type as DatabaseType) === 'dedicated'
    );

    const tabs = $derived(
        [
            {
                href: baseDatabasePath,
                // For dedicated DBs, show "Overview" instead of Tables/Collections
                title: isDedicatedType ? 'Overview' : terminology.entity.title.plural,
                event: isDedicatedType ? 'overview' : terminology.entity.lower.plural,
                hasChildren: !isDedicatedType
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

    const responsiveInlineStart = $derived($isSmallViewport ? '0' : '-2.5rem');
</script>

<Cover databasesMainScreen>
    <svelte:fragment slot="header">
        <CoverTitle href={baseDatabasesPath} style="margin-inline-start: {responsiveInlineStart};">
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
