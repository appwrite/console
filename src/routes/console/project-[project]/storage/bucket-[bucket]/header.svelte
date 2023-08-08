<script lang="ts">
    import { page } from '$app/stores';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { bucket } from './store';

    const projectId = $page.params.project;
    const bucketId = $page.params.bucket;
    const path = `/console/project-${projectId}/storage/bucket-${bucketId}`;
    const tabs = [
        {
            href: path,
            title: 'Files',
            event: 'files',
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
            event: 'settings',
            title: 'Settings'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/storage`}>
            {$bucket?.name}
        </CoverTitle>
        {#if $bucket?.$id}
            <Id value={$bucket.$id} event="bucket">{$bucket.$id}</Id>
        {/if}
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
