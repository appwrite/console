<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        EmptySearch,
        SearchQuery,
        PaginationWithLimit,
        Heading,
        ViewSelector,
        EmptyFilter
    } from '$lib/components';
    import Create from './create.svelte';
    import { goto } from '$app/navigation';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { showCreate } from './store';
    import { View } from '$lib/helpers/load';
    import { Filters, hasPageQueries } from '$lib/components/filters';
    import Table from './table.svelte';
    import type { Column } from '$lib/helpers/types';
    import { writable } from 'svelte/store';
    import { canWriteTopics } from '$lib/stores/roles';

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
        await goto(
            `${base}/project-${$page.params.region}-${project}/messaging/topics/topic-${event.detail.$id}`
        );
    };
</script>

<Container>
    <div class="u-flex u-flex-vertical">
        <div class="u-flex u-main-space-between">
            <Heading tag="h2" size="5">Topics</Heading>
            {#if $canWriteTopics}
                <div class="is-only-mobile">
                    <Button on:click={() => ($showCreate = true)} event="create_topic">
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text">Create topic</span>
                    </Button>
                </div>
            {/if}
        </div>
        <!-- TODO: fix width of search input in mobile -->
        <SearchQuery search={data.search} placeholder="Search by name or ID">
            <div class="u-flex u-gap-16 is-not-mobile">
                <Filters query={data.query} {columns} />
                <ViewSelector
                    view={View.Table}
                    {columns}
                    hideView
                    allowNoColumns
                    showColsTextMobile />
                {#if $canWriteTopics}
                    <Button on:click={() => ($showCreate = true)} event="create_topic">
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text">Create topic</span>
                    </Button>
                {/if}
            </div>
        </SearchQuery>
        <div class="u-flex u-gap-16 is-only-mobile u-margin-block-start-16">
            <div class="u-flex-basis-50-percent">
                <!-- TODO: fix width -->
                <ViewSelector
                    view={View.Table}
                    {columns}
                    hideView
                    allowNoColumns
                    showColsTextMobile />
            </div>
            <div class="u-flex-basis-50-percent">
                <!-- TODO: fix width -->
                <Filters query={data.query} {columns} />
            </div>
        </div>
    </div>
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
            <Button
                secondary
                href={`${base}/project-${$page.params.region}-${$page.params.project}/messaging/topics`}>
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
