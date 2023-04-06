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
        <Copy value={$collection?.$id}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                Collection ID
            </Pill>
        </Copy>
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
