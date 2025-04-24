<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { canWriteCollections } from '$lib/stores/roles';
    import { collection } from './store';
    import { isTabletViewport } from '$lib/stores/viewport';

    const projectId = $derived(page.params.project);
    const databaseId = $derived(page.params.database);
    const collectionId = $derived(page.params.collection);

    const path = $derived(
        `${base}/project-${projectId}/databases/database-${databaseId}/collection-${collectionId}`
    );

    const tabs = $derived.by(() =>
        [
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
                event: 'settings',
                disabled: !$canWriteCollections
            }
        ].filter((tab) => !tab.disabled)
    );
</script>

<div style:margin-top={$isTabletViewport ? '48px' : 0}>
    <Cover>
        <svelte:fragment slot="header">
            <CoverTitle href={`${base}/project-${projectId}/databases/database-${databaseId}`}>
                {$collection?.name}
            </CoverTitle>
            {#key $collection?.$id}
                <Id value={$collection?.$id}>{$collection?.$id}</Id>
            {/key}
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
</div>
