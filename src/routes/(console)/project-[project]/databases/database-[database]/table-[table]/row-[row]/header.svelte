<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { doc } from './store';

    const projectId = page.params.project;
    const databaseId = page.params.database;
    const collectionId = page.params.table;
    const documentId = page.params.row;
    const path = `${base}/project-${projectId}/databases/database-${databaseId}/table-${collectionId}/row-${documentId}`;
    const tabs = [
        {
            href: path,
            title: 'Overview',
            event: 'overview'
        },
        {
            href: `${path}/data`,
            title: 'Data',
            event: 'data',
            hasChildren: true
        },
        {
            href: `${path}/activity`,
            title: 'Activity',
            event: 'activity',
            hasChildren: true
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle
            href={`${base}/project-${projectId}/databases/database-${databaseId}/table-${collectionId}`}>
            {$doc?.$id}
        </CoverTitle>
        <Id value={$doc?.$id} event="row">Row ID</Id>
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
