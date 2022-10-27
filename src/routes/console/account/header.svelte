<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Copy, Tab, Tabs } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Cover, CoverTitle } from '$lib/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
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

    async function logout() {
        await sdkForConsole.account.deleteSession('current');
        await goto(`${base}/login`);
    }
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>
            {$user.name}
        </CoverTitle>
        <Copy value={$user.$id}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                Project ID
            </Pill>
        </Copy>
        <div class="u-margin-inline-start-auto">
            <Button secondary on:click={logout}>Logout</Button>
        </div>
    </svelte:fragment>
    <Tabs>
        {#each tabs as tab}
            <Tab href={tab.href} selected={$page.url.pathname === tab.href}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
