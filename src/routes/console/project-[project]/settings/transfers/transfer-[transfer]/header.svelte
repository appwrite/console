<script lang="ts">
    import { page } from '$app/stores';
    import { Copy, Tab, Tabs } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { transfer } from './store';

    const projectId = $page.params.project;
    const transferId = $page.params.transfer;
    const path = `/console/project-${projectId}/settings/transfers/transfer-${transferId}`;
    const tabs = [
        {
            href: path,
            title: 'Summary',
            event: 'summary',
            hasChildren: true
        },
        {
            href: `${path}/logs`,
            title: 'Logs',
            event: 'logs',
            hasChildren: true
        },
        {
            href: `${path}/settings`,
            event: 'settings',
            title: 'Settings'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/settings/transfers/`}>
            {$transfer?.$id}
        </CoverTitle>
        <Copy value={$transfer?.$id} event="transfer">
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                Transfer ID
            </Pill>
        </Copy>
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
