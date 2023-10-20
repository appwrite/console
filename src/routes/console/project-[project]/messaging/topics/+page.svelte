<script lang="ts">
    import { page } from '$app/stores';
    import {
        TableHeader,
        TableBody,
        TableRowLink,
        TableCellHead,
        TableCellText,
        TableCell,
        TableCellHeadCheck,
        TableScroll,
        TableCellCheck
    } from '$lib/elements/table';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        EmptySearch,
        SearchQuery,
        PaginationWithLimit,
        Heading,
        Id,
        ViewSelector
    } from '$lib/components';
    import Create from './create.svelte';
    import { goto } from '$app/navigation';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { columns, showCreate } from './store';
    import { View } from '$lib/helpers/load';
    import Filters from '$lib/components/filters/filters.svelte';

    export let data: PageData;
    let selected: string[] = [];

    const project = $page.params.project;
    const topicCreated = async (event: CustomEvent<Models.Team<Record<string, unknown>>>) => {
        await goto(`${base}/console/project-${project}/messaging/topics/topic-${event.detail.$id}`);
    };
</script>

<Container>
    <div class="u-flex u-flex-vertical">
        <div class="u-flex u-main-space-between">
            <Heading tag="h2" size="5">Topics</Heading>
            <div class="is-only-mobile">
                <Button on:click={() => ($showCreate = true)} event="create_topic">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Create topic</span>
                </Button>
            </div>
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
                <Button on:click={() => ($showCreate = true)} event="create_topic">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Create topic</span>
                </Button>
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
        <TableScroll>
            <TableHeader>
                <TableCellHeadCheck
                    bind:selected
                    pageItemsIds={data.topics.topics.map((d) => d.$id)} />
                {#each $columns as column}
                    {#if column.show}
                        <TableCellHead width={column.width}>{column.title}</TableCellHead>
                    {/if}
                {/each}
            </TableHeader>
            <TableBody>
                {#each data.topics.topics as topic (topic.$id)}
                    <TableRowLink
                        href={`${base}/console/project-${project}/messaging/topics/topic-${topic.$id}`}>
                        <TableCellCheck bind:selectedIds={selected} id={topic.$id} />

                        {#each $columns as column (column.id)}
                            {#if column.show}
                                {#if column.id === '$id'}
                                    {#key $columns}
                                        <TableCell title={column.title} width={column.width}>
                                            <Id value={topic.$id}>{topic.$id}</Id>
                                        </TableCell>
                                    {/key}
                                {:else if column.type === 'datetime'}
                                    <TableCellText title={column.title} width={column.width}>
                                        {#if !topic[column.id]}
                                            -
                                        {:else}
                                            {toLocaleDateTime(topic[column.id])}
                                        {/if}
                                    </TableCellText>
                                {:else}
                                    <TableCellText title={column.title} width={column.width}>
                                        {topic[column.id]}
                                    </TableCellText>
                                {/if}
                            {/if}
                        {/each}
                    </TableRowLink>
                {/each}
            </TableBody>
        </TableScroll>

        <PaginationWithLimit
            name="Topics"
            limit={data.limit}
            offset={data.offset}
            total={data.topics.total} />
        <!-- TODO: remove data.search != 'empty' when the API is ready with data -->
    {:else if data.search && data.search != 'empty'}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find '{data.search}'</b>
                <p>There are no topics that match your search.</p>
            </div>
            <Button secondary href={`/console/project-${$page.params.project}/messaging/topics`}>
                Clear Search
            </Button>
        </EmptySearch>
    {:else}
        <!-- TODO: update docs link -->
        <Empty
            single
            on:click={() => ($showCreate = true)}
            href="https://appwrite.io/docs/references/cloud/client-web/teams"
            target="topic" />
    {/if}
</Container>

<!-- TODO: handle create -->
<Create bind:showCreate={$showCreate} on:created={topicCreated} />
