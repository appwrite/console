<script lang="ts">
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import LL from '$i18n/i18n-svelte';

    const projectId = $page.params.project;
    const path = `/console/project-${projectId}/settings`;
    const tabs = [
        {
            href: path,
            title: $LL.console.project.navbar.settings.overview(),
            event: 'overview'
        },
        {
            href: `${path}/domains`,
            title: $LL.console.project.navbar.settings.customDomains(),
            event: 'domains'
        },
        {
            href: `${path}/webhooks`,
            title: $LL.console.project.navbar.settings.webhooks(),
            event: 'webhooks'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>{$LL.console.project.title.settings.header()}</CoverTitle>
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
