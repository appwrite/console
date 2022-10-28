<script lang="ts">
    import { page } from '$app/stores';
    import { Copy, Tab, Tabs } from '$lib/components';
    import { Pill } from '$lib/elements';
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
        <CoverTitle href={`/console/project-${projectId}/storage`}>
            {$bucket?.name}
        </CoverTitle>
        <Copy value={$bucket?.$id}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                Bucket ID
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
