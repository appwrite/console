<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        EmptySearch,
        SearchQuery,
        PaginationWithLimit,
        EmptyFilter,
        ViewSelector
    } from '$lib/components';
    import Create from './create.svelte';
    import { goto } from '$app/navigation';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { showCreate } from './store';
    import { Filters, hasPageQueries } from '$lib/components/filters';
    import Table from './table.svelte';
    import type { Column } from '$lib/helpers/types';
    import { writable } from 'svelte/store';
    import { canWriteTopics } from '$lib/stores/roles';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { View } from '$lib/helpers/load';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';

    export let data: PageData;

    const project = $page.params.project;
    const columns = writable<Column[]>([
        { id: '$id', title: 'Topic ID', type: 'string', show: true, width: 140 },
        { id: 'name', title: 'Name', type: 'string', show: true, width: 140 },
        { id: 'emailTotal', title: 'Email Subscribers', type: 'integer', show: false, width: 140 },
        { id: 'smsTotal', title: 'SMS Subscribers', type: 'integer', show: false, width: 140 },
        { id: 'pushTotal', title: 'Push Subscribers', type: 'integer', show: false, width: 140 },
        {
            id: 'total',
            title: 'Subscribers',
            type: 'integer',
            show: true,
            filter: false,
            width: 140
        },
        { id: '$createdAt', title: 'Created', type: 'datetime', show: true, width: 140 }
    ]);

    const topicCreated = async (event: CustomEvent<Models.Team<Record<string, unknown>>>) => {
        await goto(`${base}/project-${project}/messaging/topics/topic-${event.detail.$id}`);
    };
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery search={data.search} placeholder="Search by name or ID" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <Filters query={data.query} {columns} analyticsSource="messaging_topics_filter" />
            <ViewSelector view={View.Table} {columns} hideView allowNoColumns />
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
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find '{data.search}'</b>
                <p>There are no topics that match your search.</p>
            </div>
            <Button secondary href={`${base}/project-${$page.params.project}/messaging/topics`}>
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
