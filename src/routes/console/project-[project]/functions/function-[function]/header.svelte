<script lang="ts">
    import { page } from '$app/stores';
    import LL from '$i18n/i18n-svelte';
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
            title: $LL.console.project.navbar.functions.deployments(),
            event: 'deployments',
            hasChildren: true
        },
        {
            href: `${path}/usage`,
            title: $LL.console.project.navbar.functions.usage(),
            event: 'sage',
            hasChildren: true
        },
        {
            href: `${path}/executions`,
            title: $LL.console.project.navbar.functions.executions(),
            event: 'executions',
            hasChildren: true
        },
        {
            href: `${path}/settings`,
            event: 'settings',
            title: $LL.console.project.navbar.functions.settings()
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/functions`}>
            {$func?.name}
        </CoverTitle>
        <Id value={$func?.$id} event="function">{$LL.console.project.table.pill.functionId()}</Id>
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
