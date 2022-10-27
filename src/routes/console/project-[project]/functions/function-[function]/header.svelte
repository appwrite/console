<script lang="ts">
    import { page } from '$app/stores';
    import { Copy, Tab, Tabs } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Cover, CoverTitle } from '$lib/layout';
    import { func } from './store';

    const projectId = $page.params.project;
    const functionId = $page.params.function;
    const path = `/console/project-${projectId}/functions/function-${functionId}`;
    const tabs = [
        {
            href: path,
            title: 'Deployments'
        },
        {
            href: `${path}/usage`,
            title: 'Usage'
        },
        {
            href: `${path}/executions`,
            title: 'Executions'
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
                ID Details
            </Pill>
        </Copy>
    </svelte:fragment>

    <Tabs>
        {#each tabs as tab}
            <Tab href={tab.href} selected={$page.url.pathname === tab.href}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
