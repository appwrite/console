<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Id, Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { user } from './store';

    const path = `${base}/project-${$page.params.region}-${$page.params.project}/auth/user-${$page.params.user}`;
    const tabs = [
        {
            href: path,
            title: 'Overview',
            event: 'overview'
        },
        {
            href: `${path}/memberships`,
            title: 'Memberships',
            event: 'memberships'
        },
        {
            href: `${path}/identities`,
            title: 'Identities',
            event: 'identities'
        },
        {
            href: `${path}/targets`,
            title: 'Targets',
            event: 'targets'
        },
        {
            href: `${path}/sessions`,
            title: 'Sessions',
            event: 'sessions'
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
        <CoverTitle href={`${base}/project-${$page.params.region}-${$page.params.project}/auth`}>
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
