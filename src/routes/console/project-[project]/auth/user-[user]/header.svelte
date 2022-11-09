<script lang="ts">
    import { page } from '$app/stores';
    import { Copy, Tab, Tabs } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { user } from './store';

    const projectId = $page.params.project;
    const userId = $page.params.user;
    const path = `/console/project-${projectId}/auth/user-${userId}`;
    const tabs = [
        {
            href: path,
            title: 'Overview'
        },
        {
            href: `${path}/memberships`,
            title: 'Memberships'
        },
        {
            href: `${path}/sessions`,
            title: 'Sessions'
        },
        {
            href: `${path}/activity`,
            title: 'Activity',
            hasChildren: true
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/auth`}>
            {$user.name ? $user.name : '-'}
        </CoverTitle>
        <Copy value={$user.$id}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                User ID
            </Pill>
        </Copy>
    </svelte:fragment>

    <Tabs>
        {#each tabs as tab}
            <Tab href={tab.href} selected={isTabSelected(tab, $page.url.pathname, path, tabs)}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
