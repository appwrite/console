<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Id } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import type { PageData } from './$types';
    import ProviderType from '../../providerType.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { project } from '$routes/(console)/project-[project]/store';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { targetsById } from '../../store';
    import { MessagingProviderType, type Models } from '@appwrite.io/console';
    import type { Column } from '$lib/helpers/types';
    import { Badge, FloatingActionBar, Table, Typography } from '@appwrite.io/pink-svelte';
    import Confirm from '$lib/components/confirm.svelte';

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
            await sdk.forProject.messaging.deleteSubscriber(page.params.topic, subscriberId);
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

<Table.Root {columns} allowSelection let:root bind:selectedRows={selectedIds}>
    <svelte:fragment slot="header" let:root>
        {#each columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each data.subscribers.subscribers as subscriber (subscriber.$id)}
        {@const target = subscriber.target}
        <Table.Row.Link
            {root}
            id={subscriber.$id}
            href={`${base}/project-${$project.$id}/auth/user-${subscriber.target.userId}`}>
            {#each columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === '$id'}
                        {#key column.id}
                            <Id value={subscriber.$id}>
                                {subscriber.$id}
                            </Id>
                        {/key}
                    {:else if column.id === 'targetId'}
                        <Id value={subscriber[column.id]}>
                            {subscriber[column.id]}
                        </Id>
                    {:else if column.id === 'target'}
                        {#if target.providerType === MessagingProviderType.Push}
                            {target.name}
                        {:else}
                            {target.identifier}
                        {/if}
                    {:else if column.id === 'type'}
                        <ProviderType type={subscriber.target.providerType} size="xs" />
                    {:else if column.id === '$createdAt'}
                        {toLocaleDateTime(subscriber[column.id])}
                    {:else}
                        {subscriber[column.id]}
                    {/if}
                </Table.Cell>
            {/each}
        </Table.Row.Link>
    {/each}
</Table.Root>

{#if selectedIds.length > 0}
    <FloatingActionBar>
        <svelte:fragment slot="start">
            <Badge content={selectedIds.length.toString()} />
            <span>
                {selectedIds.length > 1 ? 'subscribers' : 'subscriber'}
                selected
            </span>
        </svelte:fragment>
        <svelte:fragment slot="end">
            <Button text on:click={() => (selectedIds = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </FloatingActionBar>
{/if}

<Confirm
    title="Delete subscribers"
    bind:open={showDelete}
    onSubmit={handleDelete}
    disabled={deleting}>
    <Typography.Text>
        Are you sure you want to delete <b>{selectedIds.length}</b>
        {selectedIds.length > 1 ? 'subscribers' : 'subscriber'}?
    </Typography.Text>
</Confirm>
