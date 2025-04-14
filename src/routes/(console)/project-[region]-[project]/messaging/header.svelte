<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';

    const projectId = $page.params.project;
    const path = `${base}/project-${$page.params.region}-${projectId}/messaging`;
    const tabs = [
        {
            href: path,
            title: 'Messages',
            event: 'messages',
            hasChildren: true
        },
        {
            href: `${path}/topics`,
            title: 'Topics',
            event: 'topics',
            hasChildren: true
        },
        {
            href: `${path}/providers`,
            title: 'Providers',
            event: 'providers'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>Messaging</CoverTitle>
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
