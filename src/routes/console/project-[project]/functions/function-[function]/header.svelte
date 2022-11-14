<script lang="ts">
    import { page } from '$app/stores';
    import { Copy, Tab, Tabs } from '$lib/components';
    import { Pill } from '$lib/elements';
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
            hasChildren: true
        },
        {
            href: `${path}/usage`,
            title: 'Usage'
        },
        {
            href: `${path}/executions`,
            title: 'Executions',
            hasChildren: true
        },
        {
            href: `${path}/settings`,
            title: 'Settings'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/functions`}>
            {$func?.name}
        </CoverTitle>
        <Copy value={$func?.$id}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                Function ID
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
