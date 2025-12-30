<script lang="ts">
    import { base } from '$app/paths';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { type DeleteOperationState, Id, MultiSelectionTable } from '$lib/components';
    import type { PageData } from './$types';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sdk } from '$lib/stores/sdk';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import type { Column } from '$lib/helpers/types';
    import { page } from '$app/state';
    import { canWriteTopics } from '$lib/stores/roles';
    import { Table } from '@appwrite.io/pink-svelte';

    let {
        data,
        columns
    }: {
        data: PageData;
        columns: Column[];
    } = $props();

    async function handleDelete(selectedRows: string[]): Promise<DeleteOperationState> {
        const promises = selectedRows.map((id) => {
            return sdk
                .forProject(page.params.region, page.params.project)
                .messaging.deleteTopic({ topicId: id });
        });

        try {
            await Promise.all(promises);
            trackEvent(Submit.MessagingTopicDelete, { total: selectedRows.length });
        } catch (error) {
            trackError(error, Submit.MessagingTopicDelete);
            return error;
        } finally {
            await invalidate(Dependencies.MESSAGING_TOPICS);
        }
    }
</script>

<MultiSelectionTable
    {columns}
    resource="topic"
    onDelete={handleDelete}
    allowSelection={$canWriteTopics}>
    {#snippet header(root)}
        {#each columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    {/snippet}

    {#snippet children(root)}
        {#each data.topics.topics as topic (topic.$id)}
            <Table.Row.Link
                {root}
                id={topic.$id}
                href={`${base}/project-${page.params.region}-${page.params.project}/messaging/topics/topic-${topic.$id}`}>
                {#each columns as column (column.id)}
                    <Table.Cell column={column.id} {root}>
                        {#if column.id === '$id'}
                            {#key column.id}
                                <Id value={topic.$id}>{topic.$id}</Id>
                            {/key}
                        {:else if column.type === 'datetime'}
                            {#if topic[column.id]}
                                <DualTimeView time={topic[column.id]} />
                            {:else}-{/if}
                        {:else if column.id === 'total'}
                            {topic.emailTotal + topic.smsTotal + topic.pushTotal}
                        {:else}
                            {topic[column.id]}
                        {/if}
                    </Table.Cell>
                {/each}
            </Table.Row.Link>
        {/each}
    {/snippet}
</MultiSelectionTable>
