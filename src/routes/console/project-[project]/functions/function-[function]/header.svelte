<script lang="ts">
    import { page } from '$app/stores';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { func } from './store';

    const projectId = $page.params.project;
    const functionId = $page.params.function;
    const path = `/console/project-${projectId}/functions/function-${functionId}`;
    const tabs = [
        {
            href: path,
            title: 'Deployments',
            event: 'deployments',
            hasChildren: true
        },
        {
            href: `${path}/usage`,
            title: 'Usage',
            event: 'sage',
            hasChildren: true
        },
        {
            href: `${path}/executions`,
            title: 'Executions',
            event: 'executions',
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
        <CoverTitle href={`/console/project-${projectId}/functions`}>
            {$func?.name}
        </CoverTitle>
        {#if $func?.$id}
            <Id value={$func.$id} event="function">{$func.$id}</Id>
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
