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
    import { isCloud } from '$lib/system';

    const path = `/console/account`;

    const permanentTabs = [
        {
            href: path,
            title: 'Overview',
            event: 'overview'
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
        },
        {
            href: `${path}/organizations`,
            title: 'Organizations',
            event: 'organizations',
            hasChildren: true
        }
    ];

    $: tabs = isCloud
        ? [
              ...permanentTabs,
              {
                  href: `${path}/payments`,
                  title: 'Payments details',
                  event: 'payments',
                  hasChildren: true
              }
          ]
        : permanentTabs;

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
            <Button secondary on:click={logout}>Logout</Button>
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
