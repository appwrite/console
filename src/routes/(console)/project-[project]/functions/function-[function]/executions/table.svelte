<script lang="ts">
    import { Id } from '$lib/components';
    import { timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
    import type { Column } from '$lib/helpers/types';
    import type { Models } from '@appwrite.io/console';
    import { Badge, Layout, Status, Table, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import Sheet from './sheet.svelte';
    import { capitalize } from '$lib/helpers/string';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import { logStatusConverter } from './store';

    export let columns: Column[];
    export let logs: Models.ExecutionList;

    let openSheet = false;
    let selectedLogId: string = null;
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
            on:click={() => {
                openSheet = true;
                selectedLogId = log.$id;
            }}>
            {#each columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === '$id'}
                        {#key column.id}
                            <Id value={log.$id}>{log.$id}</Id>
                        {/key}
                    {:else if column.id === '$createdAt'}
                        {capitalize(timeFromNow(log.$createdAt))}
                    {:else if column.id === 'requestPath'}
                        <Layout.Stack direction="row" alignItems="center" gap="s">
                            <Badge
                                variant="secondary"
                                type={log.responseStatusCode >= 400
                                    ? 'error'
                                    : log.responseStatusCode === 0
                                      ? undefined
                                      : 'success'}
                                content={log.responseStatusCode.toString()} />
                            <Typography.Code size="m">
                                {log.requestMethod}
                            </Typography.Code>
                            <Typography.Code size="m">
                                {log.requestPath}
                            </Typography.Code>
                        </Layout.Stack>
                    {:else if column.id === 'responseStatusCode'}
                        {log.responseStatusCode}
                    {:else if column.id === 'status'}
                        {@const status = log.status}
                        <Tooltip
                            disabled={!log?.scheduledAt || status !== 'scheduled'}
                            maxWidth="400px">
                            <div>
                                <Status
                                    status={logStatusConverter(status)}
                                    label={capitalize(status)}>
                                    {status}
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

<Sheet bind:open={openSheet} bind:selectedLogId logs={logs.executions} />
