<script lang="ts">
    import { Id } from '$lib/components';
    import type { Column } from '$lib/helpers/types';
    import type { Models } from '@appwrite.io/console';
    import { Badge, Layout, Table, Typography } from '@appwrite.io/pink-svelte';
    import Sheet from './sheet.svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';

    export let columns: Column[];
    export let logs: Models.ExecutionList;

    let openSheet = false;
    let selectedLogId: string = null;

    $: filteredColumns = columns.filter((c) => !c.exclude);
</script>

<Table.Root columns={filteredColumns} let:root>
    <svelte:fragment slot="header" let:root>
        {#each filteredColumns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each logs.executions as log}
        <Table.Row.Button
            {root}
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
