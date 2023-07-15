<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { Tab, Tabs } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import LL from '$i18n/i18n-svelte';

    const path = `/console/account`;

    $: tabs = [
        {
            href: path,
            title: $LL.console.account.navbar.header.overview(),
            event: 'overview'
        },
        {
            href: `${path}/sessions`,
            title: $LL.console.account.navbar.header.sessions(),
            event: 'sessions'
        },
        {
            href: `${path}/activity`,
            title: $LL.console.account.navbar.header.activity(),
            event: 'activity',
            hasChildren: true
        },
        {
            href: `${path}/organizations`,
            title: $LL.console.account.navbar.header.organization(),
            event: 'organizations',
            hasChildren: true
        }
    ];

    async function logout() {
        await sdk.forConsole.account.deleteSession('current');
        trackEvent(Submit.AccountLogout);
        await goto(`${base}/login`);
    }
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>
            {$user.name}
        </CoverTitle>
        <div class="u-margin-inline-start-auto">
            <Button secondary on:click={logout}>{$LL.console.account.button.logout()}</Button>
        </div>
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
