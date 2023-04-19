<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { Tab, Tabs } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';

    const path = `/console/card`;

    $: tabs = [
        {
            href: path,
            title: 'Overview',
            event: 'overview'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>
            {$user.name}
        </CoverTitle>
        <div class="u-margin-inline-start-auto">
            <Button secondary>Logout</Button>
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
