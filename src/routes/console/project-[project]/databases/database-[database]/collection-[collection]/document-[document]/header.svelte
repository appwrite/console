<script lang="ts">
    import { page } from '$app/stores';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { doc } from './store';
    import LL from '$i18n/i18n-svelte';

    const projectId = $page.params.project;
    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;
    const documentId = $page.params.document;
    const path = `/console/project-${projectId}/databases/database-${databaseId}/collection-${collectionId}/document-${documentId}`;
    const tabs = [
        {
            href: path,
            title: $LL.console.project.navbar.databases.document.overview(),
            event: 'overview'
        },
        {
            href: `${path}/data`,
            title: $LL.console.project.navbar.databases.document.data(),
            event: 'data',
            hasChildren: true
        },
        {
            href: `${path}/activity`,
            title: $LL.console.project.navbar.databases.document.activity(),
            event: 'activity',
            hasChildren: true
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle
            href={`/console/project-${projectId}/databases/database-${databaseId}/collection-${collectionId}`}>
            {$doc?.$id}
        </CoverTitle>
        <Id value={$doc?.$id} event="document"
            >{$LL.console.project.databases.table.pill.documentId()}</Id>
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
