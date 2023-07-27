<script lang="ts">
    import { page } from '$app/stores';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { database } from './store';
    import LL from '$i18n/i18n-svelte';

    const projectId = $page.params.project;
    const databaseId = $page.params.database;
    const path = `/console/project-${projectId}/databases/database-${databaseId}`;
    const tabs = [
        {
            href: path,
            title: $LL.console.project.navbar.databases.collections(),
            event: 'collections',
            hasChildren: true
        },
        {
            href: `${path}/usage`,
            title: $LL.console.project.navbar.databases.usage(),
            event: 'usage',
            hasChildren: true
        },
        {
            href: `${path}/settings`,
            title: $LL.console.project.navbar.databases.settings(),
            event: 'settings'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/databases`}>
            {$database.name}
        </CoverTitle>
        <Id value={$database.$id}>{$database.$id}</Id>
    </svelte:fragment>

    <Tabs>
        {#each tabs as tab}
            <Tab
                href={tab.href}
                selected={isTabSelected(tab, $page.url.pathname, path, tabs)}
                event={tab.event}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
