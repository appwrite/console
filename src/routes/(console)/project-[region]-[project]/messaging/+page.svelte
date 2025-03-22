<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import {
        Empty,
        EmptyFilter,
        EmptySearch,
        FloatingActionBar,
        Heading,
        Id,
        Modal,
        PaginationWithLimit,
        SearchQuery,
        ViewSelector
    } from '$lib/components';
    import { Filters, hasPageQueries } from '$lib/components/filters';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellCheck,
        TableCellHead,
        TableCellHeadCheck,
        TableCellText,
        TableHeader,
        TableRowLink,
        TableScroll
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container, ContainerHeader } from '$lib/layout';
    import { MessagingProviderType } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import CreateMessageDropdown from './createMessageDropdown.svelte';
    import FailedModal from './failedModal.svelte';
    import MessageStatusPill from './messageStatusPill.svelte';
    import ProviderType from './providerType.svelte';
    import { showCreate } from './store';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { trackEvent, Submit, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import type { Column } from '$lib/helpers/types';
    import { writable } from 'svelte/store';
    import { canWriteMessages } from '$lib/stores/roles';
    import { onDestroy, onMount } from 'svelte';
    import { stopPolling, pollMessagesStatus } from './helper';

    export let data: PageData;
    let selected: string[] = [];
    let showDelete = false;
    let deleting = false;
    let showFailed = false;
    let errors: string[] = [];
    let showCreateDropdownDesktop = false;
    let showCreateDropdownMobile = false;
    let showCreateDropdownEmpty = false;
    const columns = writable<Column[]>([
        { id: '$id', title: 'Message ID', type: 'string', show: true, width: 140 },
        { id: 'message', title: 'Message', type: 'string', show: false, filter: false, width: 140 },
        { id: 'providerType', title: 'Type', type: 'string', show: true, width: 100 },
        { id: 'status', title: 'Status', type: 'string', show: true, width: 120 },
        { id: 'scheduledAt', title: 'Scheduled at', type: 'datetime', show: true, width: 120 },
        { id: 'deliveredAt', title: 'Delivered at', type: 'datetime', show: false, width: 120 }
    ]);

    const project = $page.params.project;

    async function handleDelete() {
        showDelete = false;

        const promises = selected.map((id) =>
            sdk.forProject($page.params.region, $page.params.project).messaging.delete(id)
        );

        try {
            await Promise.all(promises);
            trackEvent(Submit.MessagingMessageDelete, {
                total: selected.length
            });
            addNotification({
                type: 'success',
                message: `${selected.length} message${selected.length > 1 ? 's' : ''} deleted`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingMessageDelete);
        } finally {
            invalidate(Dependencies.MESSAGING_MESSAGES);
            selected = [];
            showDelete = false;
        }
    }

    onMount(() => {
        const processingMessages = data.messages.messages.filter(
            (message) => message.status === 'processing'
        );

        pollMessagesStatus(processingMessages);
    });

    onDestroy(stopPolling);
</script>

<Container>
    <ContainerHeader title="Messages">
        {#if $canWriteMessages}
            <div class="is-only-mobile">
                <CreateMessageDropdown bind:showCreateDropdown={showCreateDropdownMobile} />
            </div>
        {/if}
    </ContainerHeader>
    <div class="u-flex u-flex-vertical u-gap-16 u-margin-block-start-16">
        <SearchQuery
            fullWidth
            search={data.search}
            placeholder="Search by message ID, description, type, or status">
            <div class="is-not-mobile u-width-full-line">
                <div class="u-flex u-gap-16 u-main-end">
                    <Filters query={data.query} {columns} />
                    <ViewSelector
                        view={data.view}
                        {columns}
                        hideView
                        allowNoColumns
                        showColsTextMobile />
                    {#if $canWriteMessages}
                        <CreateMessageDropdown
                            bind:showCreateDropdown={showCreateDropdownDesktop} />
                    {/if}
                </div>
            </div>
        </SearchQuery>
        <div class="is-only-mobile u-flex u-gap-16">
            <div class="u-flex-basis-50-percent">
                <ViewSelector
                    view={data.view}
                    {columns}
                    hideView
                    allowNoColumns
                    showColsTextMobile
                    fullWidthMobile />
            </div>
            <div class="u-flex-basis-50-percent">
                <Filters query={data.query} {columns} fullWidthMobile />
            </div>
        </div>
    </div>
    {#if data.messages.total}
        <TableScroll>
            <TableHeader>
                {#if $canWriteMessages}
                    <TableCellHeadCheck
                        bind:selected
                        pageItemsIds={data.messages.messages.map((d) => d.$id)} />
                {/if}
                {#each $columns as column}
                    {#if column.show}
                        <TableCellHead width={column.width}>{column.title}</TableCellHead>
                    {/if}
                {/each}
            </TableHeader>
            <TableBody>
                {#each data.messages.messages as message (message.$id)}
                    <TableRowLink
                        href={`${base}/project-${$page.params.region}-${project}/messaging/message-${message.$id}`}>
                        {#if $canWriteMessages}
                            <TableCellCheck
                                bind:selectedIds={selected}
                                id={message.$id}
                                disabled={message.status === 'processing'} />
                        {/if}
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
                                        {#if message.providerType === MessagingProviderType.Push}
                                            {message.data.title}
                                        {:else if message.providerType === MessagingProviderType.Sms}
                                            {message.data.content}
                                        {:else if message.providerType === MessagingProviderType.Email}
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
                                    <TableCellText title="Status">
                                        <span class="u-inline-flex u-gap-12 u-cross-center">
                                            <MessageStatusPill status={message.status} />
                                            {#if message.status === 'failed'}
                                                <Button
                                                    link
                                                    on:click={(e) => {
                                                        e.preventDefault();
                                                        errors = message.deliveryErrors;
                                                        showFailed = true;
                                                    }}>Details</Button>
                                            {/if}
                                        </span>
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
    {:else if $hasPageQueries}
        <EmptyFilter resource="messages" />
    {:else if data.search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find '{data.search}'</b>
                <p>There are no messages that match your search.</p>
            </div>
            <div class="u-flex u-gap-16">
                <Button external href="https://appwrite.io/docs/products/messaging/messages" text>
                    Documentation
                </Button>
                <Button
                    secondary
                    href={`${base}/project-${$page.params.region}-${$page.params.project}/messaging`}>
                    Clear search
                </Button>
            </div>
        </EmptySearch>
    {:else}
        <Empty single target="message" on:click={() => ($showCreate = true)}>
            <div class="u-text-center">
                <Heading size="7" tag="h2" trimmed={false}>
                    Create your first message to get started.
                </Heading>
                <p class="body-text-2 u-bold u-margin-block-start-4">
                    Need a hand? Learn more in our documentation.
                </p>
            </div>
            <div class="u-flex u-flex-wrap u-gap-16 u-main-center">
                <Button
                    external
                    href="https://appwrite.io/docs/products/messaging/messages"
                    text
                    event="empty_documentation"
                    ariaLabel={`create message`}>
                    Documentation
                </Button>
                {#if $canWriteMessages}
                    <CreateMessageDropdown bind:showCreateDropdown={showCreateDropdownEmpty}>
                        <Button
                            secondary
                            on:click={() => (showCreateDropdownEmpty = !showCreateDropdownEmpty)}
                            event="create_message">
                            <span class="text">Create message</span>
                        </Button>
                    </CreateMessageDropdown>
                {/if}
            </div>
        </Empty>
    {/if}
</Container>

<FailedModal bind:show={showFailed} {errors} />

<Modal
    title="Delete messages"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}
    closable={!deleting}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{selected.length}</b>
        {selected.length > 1 ? 'messages' : 'message'}?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)} disabled={deleting}>Cancel</Button>
        <Button secondary submit disabled={deleting}>Delete</Button>
    </svelte:fragment>
</Modal>
