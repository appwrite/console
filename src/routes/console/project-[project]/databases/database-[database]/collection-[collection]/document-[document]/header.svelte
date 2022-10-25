<script lang="ts">
    import { page } from '$app/stores';
    import { Copy, Tab, Tabs } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Cover } from '$lib/layout';
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
        <a
            class="back-button"
            href={`/console/project-${projectId}/databases/database-${databaseId}/collection-${collectionId}`}
            aria-label="page back">
            <span class="icon-cheveron-left" aria-hidden="true" />
        </a>
        <h1 class="heading-level-4">
            <span class="text">{$doc.$id}</span>
        </h1>
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
