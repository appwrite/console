<script lang="ts">
    import { page } from '$app/state';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { doc } from './store';
    import { getProjectRoute } from '$lib/helpers/project';

    const databaseId = page.params.database;
    const collectionId = page.params.collection;
    const documentId = page.params.document;
    const path = getProjectRoute(
        `/databases/database-${databaseId}/collection-${collectionId}/document-${documentId}`
    );
    const tabs = [
        {
            href: path,
            title: 'Data',
            event: 'data'
        },
        {
            href: `${path}/activity`,
            title: 'Activity',
            event: 'activity',
            hasChildren: true
        },
        {
            href: `${path}/settings`,
            title: 'Settings',
            event: 'settings',
            hasChildren: true
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle
            href={getProjectRoute(`/databases/database-${databaseId}/collection-${collectionId}`)}>
            {$doc?.$id}
        </CoverTitle>
        <Id value={$doc?.$id} event="document">Document ID</Id>
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
