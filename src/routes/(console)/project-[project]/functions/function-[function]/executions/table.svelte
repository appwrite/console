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
    import { Pill } from '$lib/elements';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { log } from '$lib/stores/logs';
    import { func } from '../store';
    import Delete from './delete.svelte';
    import { Button } from '$lib/elements/forms';
    import { Tooltip, Table } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import DualTimeView from '$lib/components/dualTimeView.svelte';

    let showDropdown = [];
    let showDelete = false;

    let selectedExecution: Models.Execution = null;

    export let columns: Column[];
    export let data: PageData;

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

<Table.Root>
    <svelte:fragment slot="header">
        {#each columns as column}
            {#if column.show}
                <Table.Header.Cell width={column.width.toString()}
                    >{column.title}</Table.Header.Cell>
            {/if}
        {/each}
        <Table.Header.Cell width="40" />
    </svelte:fragment>
    {#each data.executions.executions as execution, index (execution.$id)}
        <Table.Row>
            {#each columns as column}
                {#if column.show}
                    {#if column.id === '$id'}
                        {#key column.id}
                            <Table.Cell>
                                <Id value={execution.$id}>{execution.$id}</Id>
                            </Table.Cell>
                        {/key}
                    {:else if column.id === 'status'}
                        <Table.Cell>
                            {@const status = execution.status}
                            <Tooltip disabled={!execution?.scheduledAt || status !== 'scheduled'}>
                                <div>
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
                                <span slot="tooltip"
                                    >{`Scheduled to execute on ${toLocaleDateTime(execution.scheduledAt)}`}</span>
                            </Tooltip>
                        </Table.Cell>
                    {:else if column.id === '$createdAt'}
                        <Table.Cell>
                            <DualTimeView time={execution.$createdAt} />
                        </Table.Cell>
                    {:else if column.id === 'trigger'}
                        <Table.Cell>
                            <Pill>
                                <span class="text u-trim">{execution.trigger}</span>
                            </Pill>
                        </Table.Cell>
                    {:else if column.id === 'requestMethod'}
                        <Table.Cell>
                            {execution.requestMethod}
                        </Table.Cell>
                    {:else if column.id === 'responseStatusCode'}
                        <Table.Cell>
                            {execution.responseStatusCode}
                        </Table.Cell>
                    {:else if column.id === 'requestPath'}
                        <Table.Cell>
                            {execution.requestPath}
                        </Table.Cell>
                    {:else if column.id === 'duration'}
                        <Table.Cell>
                            {calculateTime(execution.duration)}
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
            <Table.Cell>
                <DropList bind:show={showDropdown[index]} placement="bottom-start" noArrow>
                    <Button
                        icon
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
            </Table.Cell>
        </Table.Row>
    {/each}
</Table.Root>

{#if selectedExecution}
    <Delete {selectedExecution} bind:showDelete />
{/if}
