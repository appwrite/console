<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id, Tab } from '$lib/components';
    import Tabs from '$lib/components/tabs.svelte';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { domain } from './store';

    const path = `${base}/organization-${page.params.organization}/domains/domain-${page.params.domain}`;
    const tabs = [
        {
            href: path,
            title: 'DNS records',
            event: 'dns-records'
        },
        // {
        //     href: `${path}/certificates`,
        //     title: 'Certificates',
        //     event: 'certificates'
        // },
        {
            href: `${path}/settings`,
            title: 'Settings',
            event: 'settings'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`${base}/organization-${page.params.organization}/domains`}>
            {$domain.domain}
        </CoverTitle>
        <Id value={$domain.$id}>{$domain.$id}</Id>
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
