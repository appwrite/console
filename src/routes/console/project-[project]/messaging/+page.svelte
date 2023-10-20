<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import {
        Empty,
        EmptySearch,
        FloatingActionBar,
        Heading,
        Id,
        PaginationWithLimit,
        SearchQuery,
        ViewSelector
    } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellCheck,
        TableCellHead,
        TableCellHeadCheck,
        TableCellText,
        TableHeader,
        TableRowLink
    } from '$lib/elements/table';
    import TableScroll from '$lib/elements/table/tableScroll.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import Create from './create.svelte';
    import { columns, showCreate } from './store';
    import MessageStatusPill from './messageStatusPill.svelte';
    import ProviderType, { ProviderTypes } from './providerType.svelte';
    import Filters from '$lib/components/filters/filters.svelte';
    import FailedModal from './failedModal.svelte';

    export let data: PageData;
    let selected: string[] = [];
    let showDelete = false;
    let showFailed = false;
    let errors: string[] = [];

    const project = $page.params.project;

    async function messageCreated(event: CustomEvent<Models.Bucket>) {
        $showCreate = false;
        await goto(`${base}/console/project-${project}/messaging/message-${event.detail.$id}`);
    }
</script>

<Container>
    <div class="u-flex u-flex-vertical">
        <div class="u-flex u-main-space-between">
            <Heading tag="h2" size="5">Messages</Heading>
            <div class="is-only-mobile">
                <Button on:click={() => ($showCreate = true)} event="create_message">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Create message</span>
                </Button>
            </div>
        </div>
        <!-- TODO: fix width of search input in mobile -->
        <SearchQuery search={data.search} placeholder="Search by channel, topic, provider, or ID">
            <div class="u-flex u-gap-16 is-not-mobile">
                <!-- TODO: make this not database-specific -->
                <Filters query={data.query} {columns} />
                <ViewSelector
                    view={data.view}
                    {columns}
                    hideView
                    allowNoColumns
                    showColsTextMobile />
                <Button on:click={() => ($showCreate = true)} event="create_message">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Create message</span>
                </Button>
            </div>
        </SearchQuery>
        <div class="u-flex u-gap-16 is-only-mobile u-margin-block-start-16">
            <div class="u-flex-basis-50-percent">
                <!-- TODO: fix width -->
                <ViewSelector
                    view={data.view}
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

    {#if data.messages.total}
        <TableScroll>
            <TableHeader>
                <TableCellHeadCheck
                    bind:selected
                    pageItemsIds={data.messages.messages.map((d) => d.$id)} />
                {#each $columns as column}
                    {#if column.show}
                        <TableCellHead width={column.width}>{column.title}</TableCellHead>
                    {/if}
                {/each}
            </TableHeader>
            <TableBody>
                {#each data.messages.messages as message}
                    <TableRowLink
                        href={`${base}/console/project-${project}/messaging/message-${message.$id}`}>
                        <TableCellCheck bind:selectedIds={selected} id={message.$id} />

                        {#each $columns as column (column.id)}
                            {#if column.show}
                                {#if column.id === '$id'}
                                    {#key $columns}
                                        <TableCell title={column.title} width={column.width}>
                                            <Id value={message.$id}>{message.$id}</Id>
                                        </TableCell>
                                    {/key}
                                {:else if column.id === 'message'}
                                    <TableCellText title={column.title} width={column.width}>
                                        {#if message.providerType === ProviderTypes.Push}
                                            {message.data.title}
                                        {:else if message.providerType === ProviderTypes.Sms}
                                            {message.data.content}
                                        {:else if message.providerType === ProviderTypes.Email}
                                            {message.data.subject}
                                        {:else}
                                            Invalid provider
                                        {/if}
                                    </TableCellText>
                                {:else if column.id === 'providerType'}
                                    <TableCellText title={column.title} width={column.width}>
                                        <ProviderType type={message.providerType} size="s" />
                                    </TableCellText>
                                {:else if column.id === 'status'}
                                    <TableCellText onlyDesktop title="Status">
                                        <MessageStatusPill
                                            status={message.status}
                                            on:click={(e) => {
                                                e.preventDefault();
                                                errors = message.deliveryErrors;
                                                showFailed = true;
                                            }} />
                                    </TableCellText>
                                {:else if column.type === 'datetime'}
                                    <TableCellText title={column.title} width={column.width}>
                                        {#if !message[column.id]}
                                            -
                                        {:else}
                                            {toLocaleDateTime(message[column.id])}
                                        {/if}
                                    </TableCellText>
                                {:else}
                                    <TableCellText title={column.title} width={column.width}>
                                        {message[column.id]}
                                    </TableCellText>
                                {/if}
                            {/if}
                        {/each}
                    </TableRowLink>
                {/each}
            </TableBody>
        </TableScroll>

        <FloatingActionBar show={selected.length > 0}>
            <div class="u-flex u-cross-center u-main-space-between actions">
                <div class="u-flex u-cross-center u-gap-8">
                    <span class="indicator body-text-2 u-bold">{selected.length}</span>
                    <p>
                        <span class="is-only-desktop">
                            {selected.length > 1 ? 'messages' : 'message'}
                        </span>
                        selected
                    </p>
                </div>

                <div class="u-flex u-cross-center u-gap-8">
                    <Button text on:click={() => (selected = [])}>Cancel</Button>
                    <!-- TODO: handle delete -->
                    <Button secondary on:click={() => (showDelete = true)}>
                        <p>Delete</p>
                    </Button>
                </div>
            </div>
        </FloatingActionBar>

        <PaginationWithLimit
            name="Messages"
            limit={data.limit}
            offset={data.offset}
            total={data.messages.total} />
        <!-- TODO: remove data.search != 'empty' when the API is ready with data -->
    {:else if data.search && data.search != 'empty'}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find '{data.search}'</b>
                <p>There are no messages that match your search.</p>
            </div>
            <div class="u-flex u-gap-16">
                <!-- TODO: update docs link -->
                <Button
                    external
                    href="https://appwrite.io/docs/products/storage/upload-download"
                    text>
                    Documentation
                </Button>
                <Button secondary href={`/console/project-${$page.params.project}/messaging`}>
                    Clear search
                </Button>
            </div>
        </EmptySearch>
    {:else}
        <!-- TODO: update docs link -->
        <Empty
            single
            href="https://appwrite.io/docs"
            target="message"
            on:click={() => ($showCreate = true)} />
    {/if}
</Container>

<FailedModal bind:show={showFailed} {errors} />

<!-- TODO: handle create -->
<Create bind:showCreate={$showCreate} on:created={messageCreated} />
