<script lang="ts">
    import { page } from '$app/stores';
    import { Copy, Tab, Tabs } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Cover, CoverTitle } from '$lib/layout';
    import { collection } from './store';

    const projectId = $page.params.project;
    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;
    const path = `/console/project-${projectId}/databases/database-${databaseId}/collection-${collectionId}`;
    const tabs = [
        {
            href: path,
            title: 'Documents'
        },
        {
            href: `${path}/attributes`,
            title: 'Attributes'
        },
        {
            href: `${path}/indexes`,
            title: 'Indexes'
        },
        {
            href: `${path}/usage`,
            title: 'Usage'
        },
        {
            href: `${path}/settings`,
            title: 'Settings'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/databases/database-${databaseId}`}>
            {$collection?.name}
        </CoverTitle>
        <Copy value={$collection?.$id}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                Collection ID
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
