<script lang="ts">
    import { Confirm, Id } from '$lib/components';
    import type { Column } from '$lib/helpers/types';
    import type { Models } from '@appwrite.io/console';
    import { Badge, FloatingActionBar, Table, Typography } from '@appwrite.io/pink-svelte';
    import Sheet from './sheet.svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { Button } from '$lib/elements/forms';

    export let columns: Column[];
    export let logs: Models.ExecutionList;

    let openSheet = false;
    let selectedLogId: string = null;

    $: filteredColumns = columns.filter((c) => !c.exclude);

    let selectedRows = [];
    let showBatchDeletion = false;

    async function deleteLogs() {
        showBatchDeletion = false;

        const promises = selectedRows.map((logId) =>
            sdk
                .forProject(page.params.region, page.params.project)
                .sites.deleteLog(page.params.site, logId)
        );
        try {
            await Promise.all(promises);
            trackEvent(Submit.LogDelete);
            addNotification({
                type: 'success',
                message: `${selectedRows.length} log${selectedRows.length > 1 ? 's' : ''} deleted`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.LogDelete);
        } finally {
            selectedRows = [];
            invalidate(Dependencies.EXECUTIONS);
        }
    }
</script>

<Table.Root let:root allowSelection bind:selectedRows columns={filteredColumns}>
    <svelte:fragment slot="header" let:root>
        {#each filteredColumns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each logs.executions as log (log.$id)}
        <Table.Row.Button
            {root}
            id={log.$id}
            on:click={(e) => {
                e.stopPropagation();
                openSheet = true;
                selectedLogId = log.$id;
            }}>
            {#each filteredColumns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === '$id'}
                        {#key column.id}
                            <Id value={log.$id}>{log.$id}</Id>
                        {/key}
                    {:else if column.id === 'requestMethod'}
                        <Typography.Code size="m">
                            {log.requestMethod}
                        </Typography.Code>
                    {:else if column.id === 'duration'}
                        {calculateTime(log.duration)}
                    {:else if column.id === 'responseStatusCode'}
                        <div>
                            <Badge
                                variant="secondary"
                                type={log.responseStatusCode >= 400 ? 'error' : 'success'}
                                content={log.responseStatusCode.toString()} />
                        </div>
                    {:else if column.id === 'requestPath'}
                        <Typography.Code size="m">
                            {log.requestPath}
                        </Typography.Code>
                    {:else if column.id === '$createdAt'}
                        <DualTimeView time={log.$createdAt} />
                    {/if}
                </Table.Cell>
            {/each}
        </Table.Row.Button>
    {/each}
</Table.Root>

<Sheet bind:open={openSheet} bind:selectedLogId logs={logs.executions} />

{#if selectedRows.length > 0}
    <FloatingActionBar>
        <svelte:fragment slot="start">
            <Badge content={selectedRows.length.toString()} />
            <span>
                {selectedRows.length > 1 ? 'logs' : 'log'}
                selected
            </span>
        </svelte:fragment>
        <svelte:fragment slot="end">
            <Button text on:click={() => (selectedRows = [])}>Cancel</Button>
            <Button secondary on:click={() => (showBatchDeletion = true)}>Delete</Button>
        </svelte:fragment>
    </FloatingActionBar>
{/if}

<Confirm title="Delete logs" confirmDeletion onSubmit={deleteLogs} bind:open={showBatchDeletion}>
    <p>
        Are you sure you want to delete <b>{selectedRows.length}</b>
        {selectedRows.length > 1 ? 'logs' : 'log'}?
    </p>

    <p class="u-bold">This action is irreversible.</p>
</Confirm>
