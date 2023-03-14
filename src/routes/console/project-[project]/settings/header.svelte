<script lang="ts">
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';

    const projectId = $page.params.project;
    const path = `/console/project-${projectId}/settings`;
    const tabs = [
        {
            href: path,
            title: 'Overview',
            event: 'overview'
        },
        {
            href: `${path}/domains`,
            title: 'Domains',
            event: 'domains'
        },
        {
            href: `${path}/webhooks`,
            title: 'Webhooks',
            event: 'webhooks'
        },
        {
            href: `${path}/variables`,
            title: 'Global Variables',
            event: 'globalVariables'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>Settings</CoverTitle>
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
