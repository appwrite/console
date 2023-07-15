<script lang="ts">
    import { page } from '$app/stores';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { user } from './store';
    import LL from '$i18n/i18n-svelte';

    const projectId = $page.params.project;
    const userId = $page.params.user;
    const path = `/console/project-${projectId}/auth/user-${userId}`;
    const tabs = [
        {
            href: path,
            title: $LL.console.project.navbar.userHeader.overview(),
            event: 'overview'
        },
        {
            href: `${path}/memberships`,
            title: $LL.console.project.navbar.userHeader.membership(),
            event: 'memberships'
        },
        {
            href: `${path}/sessions`,
            title: $LL.console.project.navbar.userHeader.sessions(),
            event: 'sessions'
        },
        {
            href: `${path}/activity`,
            title: $LL.console.project.navbar.userHeader.activity(),
            event: 'activity',
            hasChildren: true
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/auth`}>
            {$user.name ? $user.name : '-'}
        </CoverTitle>
        <Id value={$user.$id} event="user">{$user.$id}</Id>
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
