<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';

    $: projectId = $page.params.project;
    $: path = `${base}/project-${projectId}/sites`;
    $: tabs = [
        {
            href: path,
            title: 'Sites',
            event: 'sites',
            hasChildren: true
        },
        {
            href: `${path}/usage`,
            title: 'Usage',
            event: 'usage'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>Sites</CoverTitle>
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
