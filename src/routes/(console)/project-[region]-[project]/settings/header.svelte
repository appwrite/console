<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import type { TabElement } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { canWriteProjects } from '$lib/stores/roles';
    import { isCloud } from '$lib/system';

    const projectId = $page.params.project;
    const path = `${base}/project-${$page.params.region}-${projectId}/settings`;
    const tabs: TabElement[] = [
        {
            href: path,
            title: 'Overview',
            event: 'overview'
        },
        {
            href: `${path}/domains`,
            title: 'Custom Domains',
            event: 'domains'
        },
        {
            href: `${path}/webhooks`,
            title: 'Webhooks',
            event: 'webhooks'
        },
        {
            href: `${path}/migrations`,
            title: 'Migrations',
            event: 'migrations',
            disabled: !$canWriteProjects
        },
        {
            href: `${path}/smtp`,
            title: 'SMTP',
            event: 'smtp',
            disabled: !$canWriteProjects
        },
        {
            href: `${path}/usage`,
            title: 'Usage',
            event: 'usage',
            hasChildren: true,
            disabled: !isCloud
        }
    ].filter((tab) => !tab.disabled);
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
