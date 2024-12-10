<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { canWriteBuckets } from '$lib/stores/roles';
    import { bucket } from './store';

    const projectId = $page.params.project;
    const bucketId = $page.params.bucket;
    const path = `${base}/project-${$page.params.region}-${projectId}/storage/bucket-${bucketId}`;
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
            title: 'Settings',
            disabled: !$canWriteBuckets
        }
    ].filter((tab) => !tab.disabled);
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`${base}/project-${$page.params.region}-${projectId}/storage`}>
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
