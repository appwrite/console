<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover } from '$lib/layout';
    import { canWriteProjects } from '$lib/stores/roles';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { isStudio } from '$lib/system';

    const path = `${base}/project-${page.params.region}-${page.params.project}/auth`;
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
            disabled: !$canWriteProjects
        },
        {
            href: `${path}/templates`,
            title: 'Templates',
            hasChildren: false,
            event: 'templates',
            disabled: !$canWriteProjects
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
            disabled: !$canWriteProjects
        }
    ].filter((tab) => !tab.disabled);
</script>

<Cover>
    <svelte:fragment slot="header">
        <Typography.Title color="--fgcolor-neutral-primary" size={isStudio ? 's' : 'xl'}
            >Auth</Typography.Title>
    </svelte:fragment>
    <Tabs>
        {#each tabs as tab}
            <Tab
                href={tab.href}
                event={tab.event}
                selected={isTabSelected(tab, page.url.pathname, path, tabs)}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
