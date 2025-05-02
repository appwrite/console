<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';

    $: projectId = page.params.project;
    $: path = `${base}/project-${page.params.region}-${page.params.project}/sites`;
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
        <Typography.Title color="--fgcolor-neutral-primary" size="xl">Sites</Typography.Title>
    </svelte:fragment>

    <Tabs variant="primary" let:root>
        {#each tabs as tab}
            <Tab
                {root}
                href={tab.href}
                selected={isTabSelected(tab, page.url.pathname, path, tabs)}
                event={tab.event}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
