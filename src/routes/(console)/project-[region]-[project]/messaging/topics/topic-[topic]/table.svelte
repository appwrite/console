<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { type DeleteOperationState, Id, MultiSelectionTable } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import type { PageData } from './$types';
    import ProviderType from '../../providerType.svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { project } from '$routes/(console)/project-[region]-[project]/store';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { targetsById } from '../../store';
    import { MessagingProviderType, type Models } from '@appwrite.io/console';
    import type { Column } from '$lib/helpers/types';
    import { Table } from '@appwrite.io/pink-svelte';

    let {
        data,
        columns
    }: {
        data: PageData;
        columns: Column[];
    } = $props();

    const subscribers = $derived.by(() => {
        const record: Record<string, Models.Subscriber> = {};
        for (const subscriber of data.subscribers.subscribers) {
            record[subscriber.$id] = subscriber;
        }

        return record;
    });

    async function handleDelete(selectedRows: string[]): Promise<DeleteOperationState> {
        async function deleteSubscriber(subscriberId: string) {
            await sdk
                .forProject(page.params.region, page.params.project)
                .messaging.deleteSubscriber({
                    topicId: page.params.topic,
                    subscriberId
                });

            const { target } = subscribers[subscriberId];
            const { [target.$id]: _, ...rest } = $targetsById;
            $targetsById = rest;
        }

        const promises = selectedRows.map((id) => deleteSubscriber(id));

        try {
            await Promise.all(promises);

            trackEvent(Submit.MessagingTopicSubscriberDelete, { total: selectedRows.length });
            return true;
        } catch (error) {
            trackError(error, Submit.MessagingTopicSubscriberDelete);
            return error.message;
        } finally {
            await invalidate(Dependencies.MESSAGING_TOPIC_SUBSCRIBERS);
        }
    }
</script>

<MultiSelectionTable {columns} resource="subscriber" onDelete={handleDelete}>
    {#snippet header(root)}
        {#each columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    {/snippet}

    {#snippet children(root)}
        {#each data.subscribers.subscribers as subscriber (subscriber.$id)}
            {@const target = subscriber.target}
            <Table.Row.Link
                {root}
                id={subscriber.$id}
                href={`${base}/project-${$project.region}-${$project.$id}/auth/user-${subscriber.target.userId}`}>
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
                            <DualTimeView time={subscriber[column.id]} />
                        {:else}
                            {subscriber[column.id]}
                        {/if}
                    </Table.Cell>
                {/each}
            </Table.Row.Link>
        {/each}
    {/snippet}
</MultiSelectionTable>
