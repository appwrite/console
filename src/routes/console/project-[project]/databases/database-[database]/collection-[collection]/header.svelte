<script lang="ts">
    import { page } from '$app/stores';
    import { ID, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { collection } from './store';

    $: projectId = $page.params.project;
    $: databaseId = $page.params.database;
    $: collectionId = $page.params.collection;
    $: path = `/console/project-${projectId}/databases/database-${databaseId}/collection-${collectionId}`;
    $: tabs = [
        {
            href: path,
            title: 'Documents',
            event: 'documents',
            hasChildren: true
        },
        {
            href: `${path}/attributes`,
            title: 'Attributes',
            event: 'attributes'
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
            event: 'settings'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/databases/database-${databaseId}`}>
            {$collection?.name}
        </CoverTitle>
        <ID value={$collection?.$id}>{$collection?.$id}</ID>
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
