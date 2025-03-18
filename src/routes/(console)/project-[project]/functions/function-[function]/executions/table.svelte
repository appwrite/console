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

    export let columns: Column[];
    export let logs: Models.ExecutionList;

    let openSheet = false;
    let selectedLogId: string = null;
</script>

<Table.Root>
    <svelte:fragment slot="header">
        {#each columns as column}
            {#if column.show && !column.hide}
                <Table.Header.Cell width={column.width + 'px'}>{column.title}</Table.Header.Cell>
            {/if}
        {/each}
    </svelte:fragment>
    {#each logs.executions as log}
        <Table.Button
            on:click={() => {
                openSheet = true;
                selectedLogId = log.$id;
            }}>
            {#each columns as column}
                {#if column.show && !column.hide}
                    {#if column.id === '$id'}
                        {#key column.id}
                            <Table.Cell>
                                <Id value={log.$id}>{log.$id}</Id>
                            </Table.Cell>
                        {/key}
                    {:else if column.id === '$createdAt'}
                        <Table.Cell>
                            <DualTimeView time={log.$createdAt} />
                        </Table.Cell>
                    {:else if column.id === 'requestPath'}
                        <Table.Cell>
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
                        </Table.Cell>
                    {:else if column.id === 'responseStatusCode'}
                        <Table.Cell>
                            {log.responseStatusCode}
                        </Table.Cell>
                    {:else if column.id === 'status'}
                        <Table.Cell>
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
                        </Table.Cell>
                    {:else if column.id === 'duration'}
                        <Table.Cell>
                            {formatTimeDetailed(log.duration)}
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
        </Table.Button>
    {/each}
</Table.Root>

<Sheet bind:open={openSheet} bind:selectedLogId logs={logs.executions} />
