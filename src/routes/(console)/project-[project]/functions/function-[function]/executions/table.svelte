<script lang="ts">
    import { DropList, DropListItem, Id } from '$lib/components';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
    import { type Models } from '@appwrite.io/console';
    import type { Column } from '$lib/helpers/types';
    import { tooltip } from '$lib/actions/tooltip';
    import { Pill } from '$lib/elements';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { log } from '$lib/stores/logs';
    import { func } from '../store';
    import Delete from './delete.svelte';
    import { Button } from '$lib/elements/forms';

    let showDropdown = [];
    let showDelete = false;

    let selectedExecution: Models.Execution = null;

    export let columns: Column[];
    export let data;

    let execution: Record<string, Models.Execution> = {};

    $: data.executions.executions.forEach((s) => {
        execution[s.$id] = s;
    });

    function showLogs(execution: Models.Execution) {
        $log.show = true;
        $log.func = $func;
        $log.data = execution;
    }
</script>

<TableScroll>
    <TableHeader>
        {#each columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
        <TableCellHead width={40} />
    </TableHeader>
    <TableBody>
        {#each data.executions.executions as execution, index (execution.$id)}
            <TableRow>
                {#each columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            {#key column.id}
                                <TableCell width={column.width} title="Execution ID">
                                    <Id value={execution.$id}>{execution.$id}</Id>
                                </TableCell>
                            {/key}
                        {:else if column.id === 'status'}
                            <TableCell width={column.width} title={column.title}>
                                {@const status = execution.status}
                                <div
                                    use:tooltip={{
                                        content: `Scheduled to execute on ${toLocaleDateTime(execution.scheduledAt)}`,
                                        disabled: !execution?.scheduledAt || status !== 'scheduled'
                                    }}>
                                    <Pill
                                        warning={status === 'waiting' || status === 'building'}
                                        danger={status === 'failed'}
                                        info={status === 'completed' || status === 'ready'}>
                                        {#if status === 'scheduled'}
                                            <span class="icon-clock" aria-hidden="true" />
                                            {timeFromNow(execution.scheduledAt)}
                                        {:else}
                                            {status}
                                        {/if}
                                    </Pill>
                                </div>
                            </TableCell>
                        {:else if column.id === '$createdAt'}
                            <TableCellText width={column.width} title={column.title}>
                                {timeFromNow(execution.$createdAt)}
                            </TableCellText>
                        {:else if column.id === 'trigger'}
                            <TableCell width={column.width} title={column.title}>
                                <Pill>
                                    <span class="text u-trim">{execution.trigger}</span>
                                </Pill>
                            </TableCell>
                        {:else if column.id === 'requestMethod'}
                            <TableCellText width={column.width} title={column.title}>
                                {execution.requestMethod}
                            </TableCellText>
                        {:else if column.id === 'responseStatusCode'}
                            <TableCellText width={column.width} title={column.title}>
                                {execution.responseStatusCode}
                            </TableCellText>
                        {:else if column.id === 'requestPath'}
                            <TableCellText width={column.width} title={column.title}>
                                {execution.requestPath}
                            </TableCellText>
                        {:else if column.id === 'duration'}
                            <TableCellText width={column.width} title={column.title}>
                                {calculateTime(execution.duration)}
                            </TableCellText>
                        {/if}
                    {/if}
                {/each}
                <TableCell width={40} showOverflow>
                    <DropList bind:show={showDropdown[index]} placement="bottom-start" noArrow>
                        <Button
                            round
                            text
                            ariaLabel="More options"
                            on:click={() => {
                                showDropdown[index] = !showDropdown[index];
                            }}>
                            <span class="icon-dots-horizontal" aria-hidden="true" />
                        </Button>
                        <svelte:fragment slot="list">
                            <DropListItem
                                icon="terminal"
                                on:click={() => {
                                    showDropdown = [];
                                    showLogs(execution);
                                }}>
                                Logs
                            </DropListItem>
                            <DropListItem
                                icon="trash"
                                event="execution_delete"
                                on:click={() => {
                                    selectedExecution = execution;
                                    showDropdown = [];
                                    showDelete = true;
                                }}>
                                Delete
                            </DropListItem>
                        </svelte:fragment>
                    </DropList>
                </TableCell>
            </TableRow>
        {/each}
    </TableBody>
</TableScroll>

{#if selectedExecution}
    <Delete {selectedExecution} bind:showDelete />
{/if}
