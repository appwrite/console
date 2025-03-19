<script lang="ts">
    import { base } from '$app/paths';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { FloatingActionBar, Id, Modal } from '$lib/components';
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
    import { Selector, Table } from '@appwrite.io/pink-svelte';

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

<Table.Root>
    <svelte:fragment slot="header">
        {#if $canWriteTopics}
            <Table.Header.Selector width="40px" />
        {/if}
        {#each columns as column}
            {#if column.show}
                <Table.Header.Cell width={column.width + 'px'}>{column.title}</Table.Header.Cell>
            {/if}
        {/each}
    </svelte:fragment>
    {#each data.topics.topics as topic (topic.$id)}
        <Table.Link
            href={`${base}/project-${$page.params.project}/messaging/topics/topic-${topic.$id}`}>
            {#if $canWriteTopics}
                <Table.Cell>
                    <Selector.Checkbox size="s" />
                </Table.Cell>
            {/if}
            {#each columns as column (column.id)}
                {#if column.show}
                    {#if column.id === '$id'}
                        {#key column.id}
                            <Table.Cell>
                                <Id value={topic.$id}>{topic.$id}</Id>
                            </Table.Cell>
                        {/key}
                    {:else if column.type === 'datetime'}
                        <Table.Cell>
                            {#if !topic[column.id]}
                                -
                            {:else}
                                {toLocaleDateTime(topic[column.id])}
                            {/if}
                        </Table.Cell>
                    {:else if column.id === 'total'}
                        <Table.Cell>
                            {topic.emailTotal + topic.smsTotal + topic.pushTotal}
                        </Table.Cell>
                    {:else}
                        <Table.Cell>
                            {topic[column.id]}
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
        </Table.Link>
    {/each}
</Table.Root>

<FloatingActionBar show={selectedIds.length > 0}>
    <div class="u-flex u-cross-center u-main-space-between actions">
        <div class="u-flex u-cross-center u-gap-8">
            <span class="indicator body-text-2 u-bold">{selectedIds.length}</span>
            <p>
                <span class="is-only-desktop">
                    {selectedIds.length > 1 ? 'topics' : 'topic'}
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

<!-- TODO: torsten, this also doesn't seem to be used -->
<Modal
    title="Delete topics"
    bind:show={showDelete}
    onSubmit={handleDelete}
    dismissible={!deleting}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{selectedIds.length}</b>
        {selectedIds.length > 1 ? 'topics' : 'topic'}?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)} disabled={deleting}>Cancel</Button>
        <Button secondary submit disabled={deleting}>Delete</Button>
    </svelte:fragment>
</Modal>
