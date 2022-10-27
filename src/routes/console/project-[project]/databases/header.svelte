<script lang="ts">
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';

    const projectId = $page.params.project;
    const path = `/console/project-${projectId}/databases`;
    const tabs = [
        {
            href: path,
            title: 'Databases'
        },
        {
            href: `${path}/usage`,
            title: 'Usage'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>Databases</CoverTitle>
    </svelte:fragment>
    <Tabs>
        {#each tabs as tab}
            <Tab href={tab.href} selected={$page.url.pathname === tab.href}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
