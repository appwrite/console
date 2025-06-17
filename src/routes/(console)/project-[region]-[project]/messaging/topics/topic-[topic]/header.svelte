<script lang="ts">
    import { topic } from './store';
    import { page } from '$app/state';
    import { Id, Tab, Tabs } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { isTabSelected } from '$lib/helpers/load';
    import { canWriteTopics } from '$lib/stores/roles';
    import { getProjectRoute } from '$lib/helpers/project';

    const topicId = page.params.topic;
    const path = getProjectRoute(`/messaging/topics/topic-${topicId}`);
    const tabs = [
        {
            href: path,
            title: 'Subscribers',
            event: 'subscribers'
        },
        {
            href: `${path}/activity`,
            title: 'Activity',
            event: 'activity'
        },
        {
            href: `${path}/settings`,
            title: 'Settings',
            event: 'settings',
            disabled: !$canWriteTopics
        }
    ].filter((tab) => !tab.disabled);
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={getProjectRoute('/messaging/topics')}>
            {$topic.name}
        </CoverTitle>
        <Id value={$topic.$id} event="topic">{$topic.$id}</Id>
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
