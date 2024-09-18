<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover, CoverTitle } from '$lib/layout';
    import { canWriteUsers } from '$lib/stores/roles';

    const projectId = $page.params.project;
    const path = `${base}/project-${projectId}/auth`;
    const tabs = [
        {
            href: path,
            title: 'Users',
            hasChildren: true,
            event: 'users'
        },
        {
            href: `${path}/teams`,
            title: 'Teams',
            hasChildren: true,
            event: 'teams'
        },
        {
            href: `${path}/security`,
            title: 'Security',
            event: 'security',
            disabled: !$canWriteUsers
        },
        {
            href: `${path}/templates`,
            title: 'Templates',
            hasChildren: false,
            event: 'templates',
            disabled: !$canWriteUsers
        },
        {
            href: `${path}/usage`,
            title: 'Usage',
            hasChildren: true,
            event: 'usage'
        },
        {
            href: `${path}/settings`,
            title: 'Settings',
            event: 'settings',
            disabled: !$canWriteUsers
        }
    ].filter((tab) => !tab.disabled);;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>Auth</CoverTitle>
    </svelte:fragment>
    <Tabs>
        {#each tabs as tab}
            <Tab
                href={tab.href}
                event={tab.event}
                selected={isTabSelected(tab, $page.url.pathname, path, tabs)}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
