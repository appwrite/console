<script lang="ts">
    import { Confirm, Id } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { Column } from '$lib/helpers/types';
    import type { Models } from '@appwrite.io/console';
    import {
        Badge,
        FloatingActionBar,
        Status,
        Table,
        Tooltip,
        Typography
    } from '@appwrite.io/pink-svelte';
    import Sheet from './sheet.svelte';
    import { capitalize } from '$lib/helpers/string';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { logStatusConverter } from './store';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { func } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';

    export let columns: Column[];
    export let executions: Models.ExecutionList;

    let open = false;
    let selectedLogId: string = null;

    let selectedRows = [];
    let showBatchDeletion = false;

    async function deleteExecutions() {
        showBatchDeletion = false;

        const promises = selectedRows.map((executionId) =>
            sdk
                .forProject(page.params.region, page.params.project)
                .functions.deleteExecution(page.params.function, executionId)
        );
        try {
            await Promise.all(promises);
            trackEvent(Submit.ExecutionDelete);
            addNotification({
                type: 'success',
                message: `${selectedRows.length} execution${selectedRows.length > 1 ? 's' : ''} deleted`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ExecutionDelete);
        } finally {
            selectedRows = [];
            showBatchDeletion = false;
            invalidate(Dependencies.EXECUTIONS);
        }
    }
</script>

<Table.Root let:root {columns} allowSelection bind:selectedRows>
    <svelte:fragment slot="header" let:root>
        {#each columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each executions.executions as log (log.$id)}
        <Table.Row.Button
            {root}
            id={log.$id}
            on:click={(e) => {
                e.stopPropagation();
                open = true;
                selectedLogId = log.$id;
            }}>
            {#each columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === '$id'}
                        {#key column.id}
                            <Id value={log.$id}>{log.$id}</Id>
                        {/key}
                    {:else if column.id === '$createdAt'}
                        <DualTimeView time={log.$createdAt} />
                    {:else if column.id === 'requestPath'}
                        <Typography.Code size="m">
                            {log.requestPath}
                        </Typography.Code>
                    {:else if column.id === 'responseStatusCode'}
                        <Badge
                            variant="secondary"
                            type={log.responseStatusCode >= 400
                                ? 'error'
                                : log.responseStatusCode === 0
                                  ? undefined
                                  : 'success'}
                            content={log.responseStatusCode.toString()} />
                    {:else if column.id === 'requestMethod'}
                        <Typography.Code size="m">
                            {log.requestMethod}
                        </Typography.Code>
                    {:else if column.id === 'trigger'}
                        {capitalize(log.trigger)}
                    {:else if column.id === 'status'}
                        {@const status = log.status}
                        <Tooltip
                            disabled={!log?.scheduledAt || status !== 'scheduled'}
                            maxWidth="400px">
                            <div>
                                <Status
                                    status={logStatusConverter(status)}
                                    label={capitalize(status)}>
                                </Status>
                            </div>
                            <span slot="tooltip">
                                {`Scheduled to execute on ${toLocaleDateTime(log.scheduledAt)}`}
                            </span>
                        </Tooltip>
                    {:else if column.id === 'duration'}
                        {calculateTime(log.duration)}
                    {/if}
                </Table.Cell>
            {/each}
        </Table.Row.Button>
    {/each}
</Table.Root>

<Sheet bind:open bind:selectedLogId logs={executions.executions} logging={$func.logging} />

{#if selectedRows.length > 0}
    <FloatingActionBar>
        <svelte:fragment slot="start">
            <Badge content={selectedRows.length.toString()} />
            <span>
                {selectedRows.length > 1 ? 'executions' : 'execution'}
                selected
            </span>
        </svelte:fragment>
        <svelte:fragment slot="end">
            <Button text on:click={() => (selectedRows = [])}>Cancel</Button>
            <Button secondary on:click={() => (showBatchDeletion = true)}>Delete</Button>
        </svelte:fragment>
    </FloatingActionBar>
{/if}

<Confirm
    title="Delete executions"
    confirmDeletion
    onSubmit={deleteExecutions}
    bind:open={showBatchDeletion}>
    <p>
        Are you sure you want to delete <strong>{selectedRows.length}</strong>
        {selectedRows.length > 1 ? 'executions' : 'execution'}?
    </p>

    <p class="u-bold">This action is irreversible.</p>
</Confirm>
