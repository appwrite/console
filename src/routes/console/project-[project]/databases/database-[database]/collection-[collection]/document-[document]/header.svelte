<script lang="ts">
    import { page } from '$app/stores';
    import { Copy, Tab, Tabs } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Cover, CoverTitle } from '$lib/layout';
    import { doc } from './store';

    const projectId = $page.params.project;
    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;
    const documentId = $page.params.document;
    const path = `/console/project-${projectId}/databases/database-${databaseId}/collection-${collectionId}/document-${documentId}`;
    const tabs = [
        {
            href: path,
            title: 'Overview'
        },
        {
            href: `${path}/activity`,
            title: 'Activity'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle
            href={`/console/project-${projectId}/databases/database-${databaseId}/collection-${collectionId}`}>
            {$doc?.$id}
        </CoverTitle>
        <Copy value={$doc.$id}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                Document ID
            </Pill>
        </Copy>
    </svelte:fragment>

    <Tabs>
        {#each tabs as tab}
            <Tab href={tab.href} selected={$page.url.pathname === tab.href}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
