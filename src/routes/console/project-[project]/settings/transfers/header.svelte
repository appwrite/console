<script lang="ts">
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';

    const projectId = $page.params.project;
    const path = `/console/project-${projectId}/transfers`;
    const tabs = [
        {
            href: path,
            title: 'Transfers',
            event: 'transfers',
            hasChildren: true
        },
        {
            href: `${path}/sources`,
            title: 'Sources',
            event: 'sources',
            hasChildren: true
        },
        {
            href: `${path}/destinations`,
            title: 'Destinations',
            event: 'destinations',
            hasChildren: true
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>Transfers</CoverTitle>
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
