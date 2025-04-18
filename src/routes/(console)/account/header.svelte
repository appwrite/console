<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Tab, Tabs } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { logout } from '$lib/helpers/logout';
    import { user } from '$lib/stores/user';
    import { isCloud } from '$lib/system';

    const path = `${base}/account`;

    $: permanentTabs = [
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
                  title: 'Payment details',
                  event: 'payments',
                  hasChildren: true
              }
          ]
        : permanentTabs;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>
            {$user.name || $user.email}
        </CoverTitle>
        <div class="u-margin-inline-start-auto">
            <Button secondary on:click={() => logout()}>Logout</Button>
        </div>
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
