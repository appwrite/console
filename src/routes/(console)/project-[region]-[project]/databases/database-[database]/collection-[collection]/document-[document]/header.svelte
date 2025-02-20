<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { doc } from './store';

    const projectId = $page.params.project;
    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;
    const documentId = $page.params.document;
    const path = `${base}/project-${$page.params.region}-${projectId}/databases/database-${databaseId}/collection-${collectionId}/document-${documentId}`;
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
            href={`${base}/project-${$page.params.region}-${projectId}/databases/database-${databaseId}/collection-${collectionId}`}>
            {$doc?.$id}
        </CoverTitle>
        <Id value={$doc?.$id} event="document">Document ID</Id>
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
