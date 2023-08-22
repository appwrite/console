<script lang="ts">
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';

    $: projectId = $page.params.project;
    $: path = `/console/project-${projectId}/functions`;
    $: tabs = [
        {
            href: path,
            title: 'Functions',
            event: 'functions',
            hasChildren: true
        },
        {
            href: `${path}/templates`,
            title: 'Templates',
            event: 'templates',
            experimental: true
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>Functions</CoverTitle>
    </svelte:fragment>

    <Tabs>
        {#each tabs as tab}
            <Tab
                href={tab.href}
                selected={isTabSelected(tab, $page.url.pathname, path, tabs)}
                event={tab.event}>
                {tab.title}
            </Tab>
            {#if tab.experimental}
                <div class="u-flex u-cross-center">
                    <div class="tag eyebrow-heading-3">
                        <span class="text u-x-small">Experimental</span>
                    </div>
                </div>
            {/if}
        {/each}
    </Tabs>
</Cover>
