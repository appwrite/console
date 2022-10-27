<script lang="ts">
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';

    const projectId = $page.params.project;
    const path = `/console/project-${projectId}/authentication`;
    const tabs = [
        {
            href: path,
            title: 'Users'
        },
        {
            href: `${path}/teams`,
            title: 'Teams'
        },
        {
            href: `${path}/usage`,
            title: 'Usage'
        },
        {
            href: `${path}/security`,
            title: 'Security'
        },
        {
            href: `${path}/settings`,
            title: 'Settings'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>Authentication</CoverTitle>
    </svelte:fragment>
    <Tabs>
        {#each tabs as tab}
            <Tab href={tab.href} selected={$page.url.pathname === tab.href}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
