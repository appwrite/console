<script lang="ts">
    import { type DeleteOperationState, Id, MultiSelectionTable } from '$lib/components';
    import type { Column } from '$lib/helpers/types';
    import type { Models } from '@appwrite.io/console';
    import { Badge, Table, Typography } from '@appwrite.io/pink-svelte';
    import Sheet from './sheet.svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { getBadgeTypeFromStatusCode } from '$lib/helpers/httpStatus';
    import { timer } from '$lib/actions/timer';

    let {
        columns,
        logs
    }: {
        columns: Column[];
        logs: Models.ExecutionList;
    } = $props();

    let openSheet = $state(false);
    let selectedLogId = $state<string | null>(null);
    const filteredColumns = $derived(columns.filter((c) => !c.exclude));

    async function deleteLogs(selectedRows: string[]): Promise<DeleteOperationState> {
        const promises = selectedRows.map((logId) =>
            sdk.forProject(page.params.region, page.params.project).sites.deleteLog({
                siteId: page.params.site,
                logId
            })
        );

        try {
            await Promise.all(promises);
            await invalidate(Dependencies.EXECUTIONS);

            addNotification({
                type: 'success',
                message: `${selectedRows.length} log${selectedRows.length > 1 ? 's' : ''} deleted`
            });

            trackEvent(Submit.LogDelete);
            return true;
        } catch (error) {
            trackError(error, Submit.LogDelete);
            return error.message;
        }
    }
</script>

<MultiSelectionTable resource="log" confirmDeletion columns={filteredColumns} onDelete={deleteLogs}>
    {#snippet header(root)}
        {#each filteredColumns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    {/snippet}

    {#snippet children(root)}
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
                        {:else if column.id === 'deploymentId'}
                            <Id value={log.deploymentId}>{log.deploymentId}</Id>
                        {:else if column.id === 'requestMethod'}
                            <Typography.Code size="m">
                                {log.requestMethod}
                            </Typography.Code>
                        {:else if column.id === 'duration'}
                            {#if ['processing', 'waiting'].includes(log.status)}
                                <span use:timer={{ start: log.$createdAt }}></span>
                            {:else}
                                {calculateTime(log.duration)}
                            {/if}
                        {:else if column.id === 'responseStatusCode'}
                            <div>
                                <Badge
                                    variant="secondary"
                                    type={getBadgeTypeFromStatusCode(log.responseStatusCode)}
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
    {/snippet}
</MultiSelectionTable>

<Sheet bind:open={openSheet} bind:selectedLogId logs={logs.executions} />
