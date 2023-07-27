<script lang="ts">
    import { page } from '$app/stores';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { collection } from './store';
    import LL from '$i18n/i18n-svelte';

    $: projectId = $page.params.project;
    $: databaseId = $page.params.database;
    $: collectionId = $page.params.collection;
    $: path = `/console/project-${projectId}/databases/database-${databaseId}/collection-${collectionId}`;
    $: tabs = [
        {
            href: path,
            title: $LL.console.project.navbar.databases.dbCollection.documents(),
            event: 'documents',
            hasChildren: true
        },
        {
            href: `${path}/attributes`,
            title: $LL.console.project.navbar.databases.dbCollection.documents(),
            event: 'attributes'
        },
        {
            href: `${path}/indexes`,
            title: $LL.console.project.navbar.databases.dbCollection.indexes(),
            event: 'indexes'
        },
        {
            href: `${path}/activity`,
            title: $LL.console.project.navbar.databases.dbCollection.activity(),
            event: 'activity',
            hasChildren: true
        },
        {
            href: `${path}/usage`,
            title: $LL.console.project.navbar.databases.dbCollection.usage(),
            event: 'usage',
            hasChildren: true
        },
        {
            href: `${path}/settings`,
            title: $LL.console.project.navbar.databases.dbCollection.settings(),
            event: 'settings'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/databases/database-${databaseId}`}>
            {$collection?.name}
        </CoverTitle>
        <Id value={$collection?.$id}>{$collection?.$id}</Id>
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
