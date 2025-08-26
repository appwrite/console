<script lang="ts">
    import { page } from '$app/state';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { team } from './store';
    import { getProjectRoute } from '$lib/helpers/project';

    const path = getProjectRoute(`/auth/teams/team-${page.params.team}`);
    const tabs = [
        {
            href: path,
            title: 'Overview',
            event: 'overview'
        },
        {
            href: `${path}/members`,
            title: 'Members',
            event: 'members',
            hasChildren: true
        },
        {
            href: `${path}/activity`,
            title: 'Activity',
            event: 'activity',
            hasChildren: true
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={getProjectRoute('/auth/teams')}>
            {$team?.name}
        </CoverTitle>
        <Id value={$team?.$id} event="team">{$team?.$id}</Id>
    </svelte:fragment>

    <Tabs>
        {#each tabs as tab}
            <Tab
                href={tab.href}
                selected={isTabSelected(tab, page.url.pathname, path, tabs)}
                event={tab.event}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
