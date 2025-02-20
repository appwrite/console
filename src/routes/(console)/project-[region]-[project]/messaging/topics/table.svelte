<script lang="ts">
    import { base } from '$app/paths';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { FloatingActionBar, Id, Modal } from '$lib/components';
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
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sdk } from '$lib/stores/sdk';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { Column } from '$lib/helpers/types';
    import { page } from '$app/stores';
    import { canWriteTopics } from '$lib/stores/roles';

    export let columns: Column[];
    export let data: PageData;

    let selectedIds: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedIds.map((id) =>
            sdk.forProject($page.params.region, $page.params.project).messaging.deleteTopic(id)
        );

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

<TableScroll>
    <TableHeader>
        {#if $canWriteTopics}
            <TableCellHeadCheck
                bind:selected={selectedIds}
                pageItemsIds={data.topics.topics.map((d) => d.$id)} />
        {/if}
        {#each columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.topics.topics as topic (topic.$id)}
            <TableRowLink
                href={`${base}/project-${$page.params.region}-${$page.params.project}/messaging/topics/topic-${topic.$id}`}>
                {#if $canWriteTopics}
                    <TableCellCheck bind:selectedIds id={topic.$id} />
                {/if}
                {#each columns as column (column.id)}
                    {#if column.show}
                        {#if column.id === '$id'}
                            {#key column.id}
                                <TableCell title={column.title} width={column.width}>
                                    <Id value={topic.$id}>{topic.$id}</Id>
                                </TableCell>
                            {/key}
                        {:else if column.type === 'datetime'}
                            <TableCellText title={column.title} width={column.width}>
                                {#if !topic[column.id]}
                                    -
                                {:else}
                                    {toLocaleDateTime(topic[column.id])}
                                {/if}
                            </TableCellText>
                        {:else if column.id === 'total'}
                            <TableCellText title={column.title} width={column.width}>
                                {topic.emailTotal + topic.smsTotal + topic.pushTotal}
                            </TableCellText>
                        {:else}
                            <TableCellText title={column.title} width={column.width}>
                                {topic[column.id]}
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

<Modal
    title="Delete topics"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}
    closable={!deleting}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{selectedIds.length}</b>
        {selectedIds.length > 1 ? 'topics' : 'topic'}?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)} disabled={deleting}>Cancel</Button>
        <Button secondary submit disabled={deleting}>Delete</Button>
    </svelte:fragment>
</Modal>
