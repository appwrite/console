<script lang="ts">
    import { page } from '$app/stores';
    import { Copy, Tab, Tabs } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Cover, CoverTitle } from '$lib/layout';
    import { database } from './store';

    const projectId = $page.params.project;
    const databaseId = $page.params.database;
    const path = `/console/project-${projectId}/databases/database-${databaseId}`;
    const tabs = [
        {
            href: path,
            title: 'Collections'
        },
        {
            href: `${path}/usage`,
            title: 'Usage'
        },
        {
            href: `${path}/settings`,
            title: 'Settings'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/databases`}>
            {$database.name}
        </CoverTitle>
        <Copy value={$database.$id}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                Database ID
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
