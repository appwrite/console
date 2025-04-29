<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { site } from './store';

    $: projectId = page.params.project;
    $: path = `${base}/project-${projectId}/sites/site-${page.params.site}`;
    $: tabs = [
        {
            href: path,
            title: 'Overview',
            event: 'overview'
        },
        {
            href: `${path}/deployments`,
            title: 'Deployments',
            event: 'deployments'
        },
        {
            href: `${path}/logs`,
            title: 'Logs',
            event: 'logs'
        },
        {
            href: `${path}/domains`,
            title: 'Domains',
            event: 'domains'
        },
        {
            href: `${path}/usage`,
            title: 'Usage',
            event: 'usage'
        },
        {
            href: `${path}/settings`,
            title: 'Settings',
            event: 'settings'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`${base}/project-${projectId}/sites`}>{$site.name}</CoverTitle>
        <Id value={$site?.$id} event="team">{$site?.$id}</Id>
    </svelte:fragment>

    <Tabs let:root>
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
