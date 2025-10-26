<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import {
        type DeleteOperationState,
        Empty,
        EmptyFilter,
        EmptySearch,
        Id,
        MultiSelectionTable,
        PaginationWithLimit
    } from '$lib/components';
    import { hasPageQueries } from '$lib/components/filters';
    import { Button } from '$lib/elements/forms';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { Container, ResponsiveContainerHeader } from '$lib/layout';
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
    import type { Column } from '$lib/helpers/types';
    import { writable } from 'svelte/store';
    import { canWriteMessages } from '$lib/stores/roles';
    import { Layout, Link, Table } from '@appwrite.io/pink-svelte';
    import { onDestroy, onMount } from 'svelte';
    import { stopPolling, pollMessagesStatus } from './helper';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();

    let showFailed = $state(false);
    let errors: string[] = $state([]);
    let selected: string[] = $state([]);

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
        {
            id: 'providerType',
            title: 'Type',
            type: 'string',
            width: { min: 100 },
            array: true,
            format: 'enum',
            elements: [
                { value: 'email', label: 'Email' },
                { value: 'sms', label: 'SMS' },
                { value: 'push', label: 'Push' }
            ]
        },
        {
            id: 'status',
            title: 'Status',
            type: 'enum',
            width: { min: 120 },
            array: true,
            format: 'enum',
            elements: ['draft', 'scheduled', 'processing', 'sent', 'failed']
        },
        {
            id: 'scheduledAt',
            title: 'Scheduled at',
            type: 'datetime',
            width: { min: 120 },
            format: 'datetime',
            elements: [
                { value: 5 * 60 * 1000, label: 'last 5 minutes' },
                { value: 60 * 60 * 1000, label: 'last 1 hour' },
                { value: 24 * 60 * 60 * 1000, label: 'last 24 hours' },
                { value: 7 * 24 * 60 * 60 * 1000, label: 'last 7 days' },
                { value: 30 * 24 * 60 * 60 * 1000, label: 'last 30 days' }
            ]
        },
        {
            id: 'deliveredAt',
            title: 'Delivered at',
            type: 'datetime',
            width: { min: 120 },
            format: 'datetime',
            elements: [
                { value: 5 * 60 * 1000, label: 'last 5 minutes' },
                { value: 60 * 60 * 1000, label: 'last 1 hour' },
                { value: 24 * 60 * 60 * 1000, label: 'last 24 hours' },
                { value: 7 * 24 * 60 * 60 * 1000, label: 'last 7 days' },
                { value: 30 * 24 * 60 * 60 * 1000, label: 'last 30 days' }
            ]
        }
    ]);

    async function handleDelete(selectedRows: string[]): Promise<DeleteOperationState> {
        const promises = selectedRows.map((id) =>
            sdk
                .forProject(page.params.region, page.params.project)
                .messaging.delete({ messageId: id })
        );

        try {
            await Promise.all(promises);
            await invalidate(Dependencies.MESSAGING_MESSAGES);

            trackEvent(Submit.MessagingMessageDelete, { total: selected.length });
            return true;
        } catch (error) {
            trackError(error, Submit.MessagingMessageDelete);
            return error.message;
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
    <ResponsiveContainerHeader
        {columns}
        hideView
        hasSearch
        hasFilters
        bind:view={data.view}
        analyticsSource="messaging_messages"
        searchPlaceholder="Search by description, type, status, or ID">
        {#if $canWriteMessages}
            <CreateMessageDropdown />
        {/if}
    </ResponsiveContainerHeader>

    {#if data.messages.total}
        <MultiSelectionTable
            resource="message"
            columns={$columns}
            onDelete={handleDelete}
            allowSelection={$canWriteMessages}>
            {#snippet header(root)}
                {#each $columns as { id, title }}
                    <Table.Cell column={id} {root}>{title}</Table.Cell>
                {/each}
            {/snippet}

            {#snippet children(root)}
                {#each data.messages.messages as message (message.$id)}
                    <Table.Row.Link
                        {root}
                        id={message.$id}
                        href={`${base}/project-${page.params.region}-${page.params.project}/messaging/message-${message.$id}`}>
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
                                    <Layout.Stack direction="row" gap="s">
                                        <MessageStatusPill status={message.status} />
                                        {#if message.status === 'failed'}
                                            <Link.Button
                                                on:click={(e) => {
                                                    e.preventDefault();
                                                    errors = message.deliveryErrors;
                                                    showFailed = true;
                                                }}>Details</Link.Button>
                                        {/if}
                                    </Layout.Stack>
                                {:else if column.type === 'datetime'}
                                    {#if !message[column.id]}
                                        -
                                    {:else}
                                        <DualTimeView time={message[column.id]} />
                                    {/if}
                                {:else}
                                    {message[column.id]}
                                {/if}
                            </Table.Cell>
                        {/each}
                    </Table.Row.Link>
                {/each}
            {/snippet}
        </MultiSelectionTable>

        <PaginationWithLimit
            name="Messages"
            limit={data.limit}
            offset={data.offset}
            total={data.messages.total} />
    {:else if $hasPageQueries}
        <EmptyFilter resource="messages" />
    {:else if data.search}
        <EmptySearch target="messages" search={data.search}>
            <div class="u-flex u-gap-16">
                <Button external href="https://appwrite.io/docs/products/messaging/messages" text>
                    Documentation
                </Button>
                <Button
                    secondary
                    href={`${base}/project-${page.params.region}-${page.params.project}/messaging`}>
                    Clear search
                </Button>
            </div>
        </EmptySearch>
    {:else}
        <Empty single target="message" on:click={() => ($showCreate = true)}>
            <svelte:fragment slot="actions">
                <Button
                    external
                    text
                    ariaLabel="create message"
                    event="empty_documentation"
                    href="https://appwrite.io/docs/products/messaging/messages">
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
