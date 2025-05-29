<script lang="ts">
    import { page } from '$app/state';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    const path = getProjectRoute('/messaging');
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
        <Typography.Title color="--fgcolor-neutral-primary" size="xl">Messaging</Typography.Title>
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
