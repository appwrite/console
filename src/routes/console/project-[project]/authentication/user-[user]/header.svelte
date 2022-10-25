<script lang="ts">
    import { page } from '$app/stores';
    import { Copy, Tab, Tabs } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Cover } from '$lib/layout';
    import { user } from './store';

    const projectId = $page.params.project;
    const userId = $page.params.user;
    const path = `/console/project-${projectId}/authentication/user-${userId}`;
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
            title: 'Activity'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <a
            class="back-button"
            href={`/console/project-${projectId}/authentication`}
            aria-label="page back">
            <span class="icon-cheveron-left" aria-hidden="true" />
        </a>
        <h1 class="heading-level-4">
            <span class="text">{$user.name}</span>
        </h1>
        <Copy value={$user.$id}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                User ID
            </Pill>
        </Copy>
    </svelte:fragment>

    <Tabs>
        {#each tabs as tab}
            <Tab href={tab.href} selected={$page.url.pathname === tab.href}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
