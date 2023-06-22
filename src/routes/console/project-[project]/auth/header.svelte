<script lang="ts">
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import LL from '$i18n/i18n-svelte';

    const projectId = $page.params.project;
    const path = `/console/project-${projectId}/auth`;
    const tabs = [
        {
            href: path,
            title: $LL.console.navbar.header.users(),
            hasChildren: true,
            event: 'users'
        },
        {
            href: `${path}/teams`,
            title: $LL.console.navbar.header.teams(),
            hasChildren: true,
            event: 'teams'
        },
        {
            href: `${path}/usage`,
            title: $LL.console.navbar.header.usage(),
            hasChildren: true,
            event: 'usage'
        },
        {
            href: `${path}/security`,
            title: $LL.console.navbar.header.security(),
            event: 'security'
        },
        {
            href: `${path}/settings`,
            title: $LL.console.navbar.header.settings(),
            event: 'settings'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>{$LL.console.title.auth()}</CoverTitle>
    </svelte:fragment>
    <Tabs>
        {#each tabs as tab}
            <Tab
                href={tab.href}
                event={tab.event}
                selected={isTabSelected(tab, $page.url.pathname, path, tabs)}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
