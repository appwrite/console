<script lang="ts">
    import { page } from '$app/stores';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { team } from './store';
    import LL from '$i18n/i18n-svelte';

    const projectId = $page.params.project;
    const teamId = $page.params.team;
    const path = `/console/project-${projectId}/auth/teams/team-${teamId}`;
    const tabs = [
        {
            href: path,
            title: $LL.console.project.navbar.teamHeader.overview(),
            event: 'overview'
        },
        {
            href: `${path}/members`,
            title: $LL.console.project.navbar.teamHeader.members(),
            event: 'members',
            hasChildren: true
        },
        {
            href: `${path}/activity`,
            title: $LL.console.project.navbar.teamHeader.activity(),
            event: 'activity',
            hasChildren: true
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/auth/teams`}>
            {$team?.name}
        </CoverTitle>
        <Id value={$team?.$id} event="team">{$team?.$id}</Id>
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
