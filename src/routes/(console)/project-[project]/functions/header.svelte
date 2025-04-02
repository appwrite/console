<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { isStudio } from '$lib/system';

    $: projectId = page.params.project;
    $: path = `${base}/project-${projectId}/functions`;
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
            event: 'templates'
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
        <Typography.Title color="--fgcolor-neutral-primary" size={isStudio ? 's' : 'xl'}
            >Functions</Typography.Title>
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
