<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import {
        Empty,
        EmptyFilter,
        EmptySearch,
        Id,
        Modal,
        PaginationWithLimit,
        SearchQuery,
        ViewSelector
    } from '$lib/components';
    import { Filters, hasPageQueries } from '$lib/components/filters';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { MessagingProviderType } from '@appwrite.io/console';
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
    import { Badge, FloatingActionBar, Layout, Table, Typography } from '@appwrite.io/pink-svelte';
    import Confirm from '$lib/components/confirm.svelte';

    export let data;

    let selected: string[] = [];
    let showDelete = false;
    let deleting = false;
    let showFailed = false;
    let errors: string[] = [];

    const columns = writable<Column[]>([
        { id: '$id', title: 'Message ID', type: 'string', width: 200 },
        {
            id: 'message',
            title: 'Message',
            type: 'string',
            hide: true,
            filter: false,
            width: { min: 140 }
        },
        { id: 'providerType', title: 'Type', type: 'string', width: { min: 100 } },
        { id: 'status', title: 'Status', type: 'string', width: { min: 120 } },
        { id: 'scheduledAt', title: 'Scheduled at', type: 'datetime', width: { min: 120 } },
        { id: 'deliveredAt', title: 'Delivered at', type: 'datetime', width: { min: 120 } }
    ]);

    const project = $page.params.project;

    async function handleDelete() {
        showDelete = false;

        const promises = selected.map((id) => sdk.forProject.messaging.delete(id));

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
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery
                search={data.search}
                placeholder="Search by ID, description, type, or status" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <Filters query={data.query} {columns} analyticsSource="messaging_messages" />
            <ViewSelector view={data.view} {columns} hideView allowNoColumns />
            {#if $canWriteMessages}
                <CreateMessageDropdown />
            {/if}
        </Layout.Stack>
    </Layout.Stack>

    {#if data.messages.total}
        <Table.Root
            columns={$columns}
            allowSelection={$canWriteMessages}
            let:root
            bind:selectedRows={selected}>
            <svelte:fragment slot="header" let:root>
                {#each $columns as { id, title }}
                    <Table.Cell column={id} {root}>{title}</Table.Cell>
                {/each}
            </svelte:fragment>
            {#each data.messages.messages as message (message.$id)}
                <Table.Row.Link
                    {root}
                    id={message.$id}
                    href={`${base}/project-${project}/messaging/message-${message.$id}`}>
                    {#each $columns as column (column.id)}
                        <Table.Cell column={column.id} {root}>
                            {#if column.id === '$id'}
                                {#key $columns}
                                    <Id value={message.$id}>{message.$id}</Id>
                                {/key}
                            {:else if column.id === 'message'}
                                {#if message.providerType === MessagingProviderType.Push}
                                    {message.data.title}
                                {:else if message.providerType === MessagingProviderType.Sms}
                                    {message.data.content}
                                {:else if message.providerType === MessagingProviderType.Email}
                                    {message.data.subject}
                                {:else}
                                    Invalid provider
                                {/if}
                            {:else if column.id === 'providerType'}
                                <ProviderType type={message.providerType} size="xs" />
                            {:else if column.id === 'status'}
                                <MessageStatusPill status={message.status} />
                                {#if message.status === 'failed'}
                                    <Button
                                        on:click={(e) => {
                                            e.preventDefault();
                                            errors = message.deliveryErrors;
                                            showFailed = true;
                                        }}>Details</Button>
                                {/if}
                            {:else if column.type === 'datetime'}
                                {#if !message[column.id]}
                                    -
                                {:else}
                                    {toLocaleDateTime(message[column.id])}
                                {/if}
                            {:else}
                                {message[column.id]}
                            {/if}
                        </Table.Cell>
                    {/each}
                </Table.Row.Link>
            {/each}
        </Table.Root>

        {#if selected.length > 0}
            <FloatingActionBar>
                <svelte:fragment slot="start">
                    <Badge content={selected.length.toString()} />
                    <span>
                        {selected.length > 1 ? 'messages' : 'message'}
                        selected
                    </span>
                </svelte:fragment>
                <svelte:fragment slot="end">
                    <Button text on:click={() => (selected = [])}>Cancel</Button>
                    <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
                </svelte:fragment>
            </FloatingActionBar>
        {/if}

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
                <Button secondary href={`${base}/project-${$page.params.project}/messaging`}>
                    Clear search
                </Button>
            </div>
        </EmptySearch>
    {:else}
        <Empty single target="message" on:click={() => ($showCreate = true)}>
            <svelte:fragment slot="actions">
                <Button
                    external
                    href="https://appwrite.io/docs/products/messaging/messages"
                    text
                    event="empty_documentation"
                    ariaLabel={`create message`}>
                    Documentation
                </Button>
                {#if $canWriteMessages}
                    <CreateMessageDropdown let:toggle>
                        <Button secondary on:click={toggle} event="create_message">
                            <span class="text">Create message</span>
                        </Button>
                    </CreateMessageDropdown>
                {/if}
            </svelte:fragment>
        </Empty>
    {/if}
</Container>

<FailedModal bind:show={showFailed} {errors} />

<Confirm title="Delete messages" bind:open={showDelete} onSubmit={handleDelete} disabled={deleting}>
    <Typography.Text>
        Are you sure you want to delete <b>{selected.length}</b>
        {selected.length > 1 ? 'messages' : 'message'}?
    </Typography.Text>
</Confirm>
