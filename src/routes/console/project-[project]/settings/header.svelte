<script lang="ts">
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover } from '$lib/layout';

    const projectId = $page.params.project;
    const path = `/console/project-${projectId}/settings`;
    const tabs = [
        {
            href: path,
            title: 'Overview'
        },
        {
            href: `${path}/domains`,
            title: 'Custom Domains'
        },
        {
            href: `${path}/webhooks`,
            title: 'Webhooks'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <h1 class="heading-level-4">
            <span class="text">Settings</span>
        </h1>
    </svelte:fragment>

    <Tabs>
        {#each tabs as tab}
            <Tab href={tab.href} selected={isTabSelected(tab, $page.url.pathname, path, tabs)}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
