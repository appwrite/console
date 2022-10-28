<script lang="ts">
    import { page } from '$app/stores';
    import { Copy, Tab, Tabs } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Cover } from '$lib/layout';
    import { user } from '$lib/stores/user';

    const path = `/console/account`;

    $: tabs = [
        {
            href: path,
            title: 'Overview'
        },
        {
            href: `${path}/sessions`,
            title: 'Sessions'
        },
        {
            href: `${path}/activity`,
            title: 'Activity'
        },
        {
            href: `${path}/organizations`,
            title: 'Organizations'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <h1 class="heading-level-4">
            <span class="text">{$user.name}</span>
        </h1>
        <Copy value={$user.$id}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                Project ID
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
