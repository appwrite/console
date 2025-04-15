<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { FloatingActionBar, Id, Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
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
    import { addNotification } from '$lib/stores/notifications';
    import type { PageData } from './$types';
    import ProviderType from '../../providerType.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { project } from '$routes/(console)/project-[region]-[project]/store';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { targetsById } from '../../store';
    import { MessagingProviderType, type Models } from '@appwrite.io/console';
    import type { Column } from '$lib/helpers/types';

    export let columns: Column[];
    export let data: PageData;

    let subscribers: Record<string, Models.Subscriber> = {};
    let selectedIds: string[] = [];
    let selected: Record<string, Models.Subscriber> = {};
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        async function deleteSubscriber(subscriberId: string) {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .messaging.deleteSubscriber($page.params.topic, subscriberId);
            const { target } = subscribers[subscriberId];
            const { [target.$id]: _, ...rest } = $targetsById;
            $targetsById = rest;
        }

        const promises = selectedIds.map((id) => deleteSubscriber(id));

        try {
            await Promise.all(promises);
            trackEvent(Submit.MessagingTopicSubscriberDelete, {
                total: selectedIds.length
            });
            addNotification({
                type: 'success',
                message: `${selectedIds.length} subscriber${
                    selectedIds.length > 1 ? 's' : ''
                } deleted`
            });
            invalidate(Dependencies.MESSAGING_TOPIC_SUBSCRIBERS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingTopicSubscriberDelete);
        } finally {
            selectedIds = [];
            showDelete = false;
        }
    }

    $: data.subscribers.subscribers.forEach((s) => {
        subscribers[s.$id] = s;
    });
    $: selectedIds.forEach((id) => {
        selected[id] = subscribers[id];
    });
</script>

<TableScroll>
    <TableHeader>
        <TableCellHeadCheck
            bind:selected={selectedIds}
            pageItemsIds={data.subscribers.subscribers.map((d) => d.$id)} />
        {#each columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.subscribers.subscribers as subscriber (subscriber.$id)}
            {@const target = subscriber.target}
            <TableRowLink
                href={`${base}/project-${$project.region}-${$project.$id}/auth/user-${subscriber.target.userId}`}>
                <TableCellCheck bind:selectedIds id={subscriber.$id} />

                {#each columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            {#key column.id}
                                <TableCell title="Subscriber ID">
                                    <Id value={subscriber.$id}>
                                        {subscriber.$id}
                                    </Id>
                                </TableCell>
                            {/key}
                        {:else if column.id === 'targetId'}
                            <TableCell title={column.title}>
                                <Id value={subscriber[column.id]}>
                                    {subscriber[column.id]}
                                </Id>
                            </TableCell>
                        {:else if column.id === 'target'}
                            <TableCell title={column.title}>
                                {#if target.providerType === MessagingProviderType.Push}
                                    {target.name}
                                {:else}
                                    {target.identifier}
                                {/if}
                            </TableCell>
                        {:else if column.id === 'type'}
                            <TableCellText title={column.title} width={column.width}>
                                <ProviderType type={subscriber.target.providerType} size="s" />
                            </TableCellText>
                        {:else if column.id === '$createdAt'}
                            <TableCellText title={column.title} width={column.width}>
                                {toLocaleDateTime(subscriber[column.id])}
                            </TableCellText>
                        {:else}
                            <TableCellText title={column.title} width={column.width}>
                                {subscriber[column.id]}
                            </TableCellText>
                        {/if}
                    {/if}
                {/each}
            </TableRowLink>
        {/each}
    </TableBody>
</TableScroll>

<FloatingActionBar show={selectedIds.length > 0}>
    <div class="u-flex u-cross-center u-main-space-between actions">
        <div class="u-flex u-cross-center u-gap-8">
            <span class="indicator body-text-2 u-bold">{selectedIds.length}</span>
            <p>
                <span class="is-only-desktop">
                    {selectedIds.length > 1 ? 'subscribers' : 'subscriber'}
                </span>
                selected
            </p>
        </div>

        <div class="u-flex u-cross-center u-gap-8">
            <Button text on:click={() => (selectedIds = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>
                <p>Delete</p>
            </Button>
        </div>
    </div>
</FloatingActionBar>

<Modal
    title="Delete subscriber"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}
    closable={!deleting}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{selectedIds.length}</b>
        {selectedIds.length > 1 ? 'subscribers' : 'subscriber'}?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)} disabled={deleting}>Cancel</Button>
        <Button secondary submit disabled={deleting}>Delete</Button>
    </svelte:fragment>
</Modal>
