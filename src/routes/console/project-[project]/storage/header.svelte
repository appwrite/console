<script lang="ts">
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { Cover } from '$lib/layout';

    const projectId = $page.params.project;
    const path = `/console/project-${projectId}/storage`;
    const tabs = [
        {
            href: path,
            title: 'Buckets'
        },
        {
            href: `${path}/usage`,
            title: 'Usage'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <h1 class="heading-level-4">
            <span class="text">Storage</span>
        </h1>
    </svelte:fragment>

    <Tabs>
        {#each tabs as tab}
            <Tab href={tab.href} selected={$page.url.pathname === tab.href}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
