<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { isStudio } from '$lib/system';

    const projectId = page.params.project;
    const path = `${base}/project-${projectId}/messaging`;
    const tabs = [
        {
            href: path,
            title: 'Messages',
            event: 'messages',
            hasChildren: true
        },
        {
            href: `${path}/topics`,
            title: 'Topics',
            event: 'topics',
            hasChildren: true
        },
        {
            href: `${path}/providers`,
            title: 'Providers',
            event: 'providers'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <Typography.Title color="--fgcolor-neutral-primary" size={isStudio ? 's' : 'xl'}
            >Messaging</Typography.Title>
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
