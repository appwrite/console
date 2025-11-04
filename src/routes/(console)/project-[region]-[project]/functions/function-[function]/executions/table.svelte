<script lang="ts">
    import { type DeleteOperationState, Id, MultiSelectionTable } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { Column } from '$lib/helpers/types';
    import type { Models } from '@appwrite.io/console';
    import { ExecutionStatus } from '@appwrite.io/console';
    import { Badge, Status, Table, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import Sheet from './sheet.svelte';
    import { capitalize } from '$lib/helpers/string';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { getBadgeTypeFromStatusCode } from '$lib/helpers/httpStatus';
    import { logStatusConverter } from './store';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { func } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { timer } from '$lib/actions/timer';

    let {
        columns,
        executions,
        limit
    }: {
        columns: Column[];
        executions: Models.ExecutionList;
        limit: number;
    } = $props();

    let open = $state(false);
    let selectedLogId: string | null = $state(null);

    async function deleteExecutions(selectedRows: string[]): Promise<DeleteOperationState> {
        const promises = selectedRows.map((executionId) =>
            sdk.forProject(page.params.region, page.params.project).functions.deleteExecution({
                functionId: page.params.function,
                executionId
            })
        );

        try {
            await Promise.all(promises);
            trackEvent(Submit.ExecutionDelete);
        } catch (error) {
            trackError(error, Submit.ExecutionDelete);
            return error;
        } finally {
            await invalidate(Dependencies.EXECUTIONS);
        }
    }
</script>

<MultiSelectionTable {columns} resource="execution" onDelete={deleteExecutions}>
    {#snippet header(root)}
        {#each columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    {/snippet}

    {#snippet children(root)}
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
                        {:else if column.id === 'deploymentId'}
                            <Id value={log.deploymentId}>{log.deploymentId}</Id>
                        {:else if column.id === '$createdAt'}
                            <DualTimeView time={log.$createdAt} />
                        {:else if column.id === 'requestPath'}
                            <Typography.Code size="m">
                                {log.requestPath}
                            </Typography.Code>
                        {:else if column.id === 'responseStatusCode'}
                            <Badge
                                variant="secondary"
                                type={getBadgeTypeFromStatusCode(log.responseStatusCode)}
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
                                disabled={!log?.scheduledAt || status !== ExecutionStatus.Scheduled}
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
                            {#if ['processing', 'waiting'].includes(log.status)}
                                <span use:timer={{ start: log.$createdAt }}></span>
                            {:else}
                                {calculateTime(log.duration)}
                            {/if}
                        {/if}
                    </Table.Cell>
                {/each}
            </Table.Row.Button>
        {/each}
    {/snippet}
</MultiSelectionTable>

<Sheet bind:open bind:selectedLogId logs={executions.executions} logging={$func.logging} {limit} />
