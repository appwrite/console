<script lang="ts">
    import { Id } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { Column } from '$lib/helpers/types';
    import type { Models } from '@appwrite.io/console';
    import { Badge, Layout, Status, Table, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import Sheet from './sheet.svelte';
    import { capitalize } from '$lib/helpers/string';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import { logStatusConverter } from './store';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { func } from '../store';

    export let columns: Column[];
    export let logs: Models.ExecutionList;

    let selectedLogId: string = null;
    let open = false;
</script>

<Table.Root {columns} let:root>
    <svelte:fragment slot="header" let:root>
        {#each columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each logs.executions as log}
        <Table.Row.Button
            {root}
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
                        {formatTimeDetailed(log.duration)}
                    {/if}
                </Table.Cell>
            {/each}
        </Table.Row.Button>
    {/each}
</Table.Root>

<Sheet bind:open bind:selectedLogId logs={logs.executions} logging={$func.logging} />
