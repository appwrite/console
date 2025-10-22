<script lang="ts">
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { Empty, EmptySearch, PaginationWithLimit, EmptyFilter } from '$lib/components';
    import Create from './create.svelte';
    import { goto } from '$app/navigation';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { showCreate } from './store';
    import { hasPageQueries, Filters } from '$lib/components/filters';
    import { SearchQuery, ViewSelector } from '$lib/components';
    import Table from './table.svelte';
    import type { Column } from '$lib/helpers/types';
    import { writable } from 'svelte/store';
    import { canWriteTopics } from '$lib/stores/roles';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { View } from '$lib/helpers/load';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';

    export let data: PageData;

    const region = page.params.region;
    const project = page.params.project;
    const columns = writable<Column[]>([
        { id: '$id', title: 'Topic ID', type: 'string', width: 200 },
        { id: 'name', title: 'Name', type: 'string', width: { min: 140 } },
        {
            id: 'emailTotal',
            title: 'Email Subscribers',
            type: 'integer',
            hide: true,
            width: { min: 140 }
        },
        {
            id: 'smsTotal',
            title: 'SMS Subscribers',
            type: 'integer',
            hide: true,
            width: { min: 140 }
        },
        {
            id: 'pushTotal',
            title: 'Push Subscribers',
            type: 'integer',
            hide: true,
            width: { min: 140 }
        },
        {
            id: 'total',
            title: 'Subscribers',
            type: 'integer',
            filter: false,
            width: { min: 140 }
        },
        { id: '$createdAt', title: 'Created', type: 'datetime', width: { min: 140 } }
    ]);

    const topicCreated = async (event: CustomEvent<Models.Team<Record<string, unknown>>>) => {
        await goto(
            `${base}/project-${region}-${project}/messaging/topics/topic-${event.detail.$id}`
        );
    };
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <SearchQuery placeholder="Search by name or ID"></SearchQuery>
        <Layout.Stack direction="row" inline>
            <Filters query={data.query} {columns} analyticsSource="messaging_topics_filter" />
            <ViewSelector ui="new" view={View.Table} {columns} hideView />
            {#if $canWriteTopics}
                <Button
                    on:click={() => {
                        $showCreate = true;
                        trackEvent(Click.MessagingTopicCreateClick);
                    }}
                    event="create_topic">
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create topic
                </Button>
            {/if}
        </Layout.Stack>
    </Layout.Stack>

    {#if data.topics.total}
        <Table columns={$columns} {data} />

        <PaginationWithLimit
            name="Topics"
            limit={data.limit}
            offset={data.offset}
            total={data.topics.total} />
    {:else if $hasPageQueries}
        <EmptyFilter resource="topics" />
    {:else if data.search}
        <EmptySearch target="topics" search={data.search}>
            <Button
                secondary
                href={`${base}/project-${page.params.region}-${page.params.project}/messaging/topics`}>
                Clear Search
            </Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            allowCreate={$canWriteTopics}
            on:click={() => ($showCreate = true)}
            href="https://appwrite.io/docs/products/messaging/topics"
            target="topic" />
    {/if}
</Container>

<Create bind:showCreate={$showCreate} on:created={topicCreated} />
