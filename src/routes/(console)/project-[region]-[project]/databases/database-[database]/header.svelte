<script lang="ts">
    import { page } from '$app/state';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { canWriteDatabases } from '$lib/stores/roles';
    import { database } from './store';
    import { getProjectRoute } from '$lib/helpers/project';

    const databaseId = page.params.database;
    const path = getProjectRoute(`/databases/database-${databaseId}`);
    const tabs = [
        {
            href: path,
            title: 'Collections',
            event: 'collections',
            hasChildren: true
        },
        {
            href: `${path}/backups`,
            title: 'Backups',
            event: 'backups',
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
            event: 'settings',
            title: 'Settings',
            disabled: !$canWriteDatabases
        }
    ].filter((tab) => !tab.disabled);
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={getProjectRoute('/databases')}>
            {$database.name}
        </CoverTitle>
        <Id value={$database.$id}>{$database.$id}</Id>
    </svelte:fragment>

    <Tabs>
        {#each tabs as tab}
            <Tab
                href={tab.href}
                selected={isTabSelected(tab, page.url.pathname, path, tabs)}
                event={tab.event}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
