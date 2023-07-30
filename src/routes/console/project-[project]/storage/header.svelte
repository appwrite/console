<script lang="ts">
    import { page } from '$app/stores';
    import LL from '$i18n/i18n-svelte';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';

    const projectId = $page.params.project;
    const path = `/console/project-${projectId}/storage`;
    const tabs = [
        {
            href: path,
            title: $LL.console.project.navbar.storage.buckets(),
            event: 'buckets',
            hasChildren: true
        },
        {
            href: `${path}/usage`,
            title: $LL.console.project.navbar.storage.usage(),
            event: 'usage',
            hasChildren: true
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>{$LL.console.project.title.storage()}</CoverTitle>
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
