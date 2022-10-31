<script lang="ts">
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';

    const projectId = $page.params.project;
    const path = `/console/project-${projectId}/storage`;
    const tabs = [
        {
            href: path,
            title: 'Buckets',
            hasChildren: true
        },
        {
            href: `${path}/usage`,
            title: 'Usage'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>Storage</CoverTitle>
    </svelte:fragment>
    <Tabs>
        {#each tabs as tab}
            <Tab href={tab.href} selected={isTabSelected(tab, $page.url.pathname, path, tabs)}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
