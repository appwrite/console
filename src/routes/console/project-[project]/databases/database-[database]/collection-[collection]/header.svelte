<script lang="ts">
    import { page } from '$app/stores';
    import { Copy, Tab, Tabs } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { collection } from './store';

    const projectId = $page.params.project;
    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;
    const path = `/console/project-${projectId}/databases/database-${databaseId}/collection-${collectionId}`;
    const tabs = [
        {
            href: path,
            title: 'Documents',
            hasChildren: true
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
            href: `${path}/activity`,
            title: 'Activity',
            hasChildren: true
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
            <Tab href={tab.href} selected={isTabSelected(tab, $page.url.pathname, path, tabs)}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
