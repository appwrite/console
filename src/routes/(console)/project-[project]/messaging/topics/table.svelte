<script lang="ts">
    import { base } from '$app/paths';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Id, Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import type { PageData } from './$types';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sdk } from '$lib/stores/sdk';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { Column } from '$lib/helpers/types';
    import { page } from '$app/stores';
    import { canWriteTopics } from '$lib/stores/roles';
    import { Badge, FloatingActionBar, Table } from '@appwrite.io/pink-svelte';

    export let columns: Column[];
    export let data: PageData;

    let selectedIds: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedIds.map((id) => sdk.forProject.messaging.deleteTopic(id));

        try {
            await Promise.all(promises);
            trackEvent(Submit.MessagingTopicDelete, {
                total: selectedIds.length
            });
            addNotification({
                type: 'success',
                message: `${selectedIds.length} topic${selectedIds.length > 1 ? 's' : ''} deleted`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingTopicDelete);
        } finally {
            invalidate(Dependencies.MESSAGING_TOPICS);
            selectedIds = [];
            showDelete = false;
        }
    }
</script>

<Table.Root {columns} allowSelection={$canWriteTopics} let:root bind:selectedRows={selectedIds}>
    <svelte:fragment slot="header" let:root>
        {#each columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each data.topics.topics as topic (topic.$id)}
        <Table.Row.Link
            {root}
            id={topic.$id}
            href={`${base}/project-${$page.params.project}/messaging/topics/topic-${topic.$id}`}>
            {#each columns as column (column.id)}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === '$id'}
                        {#key column.id}
                            <Id value={topic.$id}>{topic.$id}</Id>
                        {/key}
                    {:else if column.type === 'datetime'}
                        {topic[column.id] ? toLocaleDateTime(topic[column.id]) : '-'}
                    {:else if column.id === 'total'}
                        {topic.emailTotal + topic.smsTotal + topic.pushTotal}
                    {:else}
                        {topic[column.id]}
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
                {selectedIds.length > 1 ? 'topics' : 'topic'}
                selected
            </span>
        </svelte:fragment>
        <svelte:fragment slot="end">
            <Button text on:click={() => (selectedIds = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </FloatingActionBar>
{/if}

<Modal title="Delete topics" bind:show={showDelete} onSubmit={handleDelete} closable={!deleting}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{selectedIds.length}</b>
        {selectedIds.length > 1 ? 'topics' : 'topic'}?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)} disabled={deleting}>Cancel</Button>
        <Button secondary submit disabled={deleting}>Delete</Button>
    </svelte:fragment>
</Modal>
