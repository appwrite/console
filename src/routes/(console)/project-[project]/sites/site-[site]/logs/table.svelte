<script lang="ts">
    import { Id } from '$lib/components';
    import { TableRow } from '$lib/elements/table';
    import { timeFromNow } from '$lib/helpers/date';
    import type { Column } from '$lib/helpers/types';
    import type { Models } from '@appwrite.io/console';
    import { Badge, InlineCode, Layout, Table } from '@appwrite.io/pink-svelte';

    export let columns: Column[];
    export let executions: Models.ExecutionList;
</script>

<Table.Root>
    <svelte:fragment slot="header">
        {#each columns as column}
            {#if column.show}
                <Table.Header.Cell>{column.title}</Table.Header.Cell>
            {/if}
        {/each}
    </svelte:fragment>
    {#each executions.executions as execution}
        <TableRow>
            {#each columns as column}
                {#if column.show}
                    {#if column.id === '$id'}
                        {#key column.id}
                            <Table.Cell>
                                <Id value={execution.$id}>{execution.$id}</Id>
                            </Table.Cell>
                        {/key}
                    {:else if column.id === '$createdAt'}
                        <Table.Cell>
                            {timeFromNow(execution.$createdAt)}
                        </Table.Cell>
                    {:else if column.id === 'responseStatusCode'}
                        <Table.Cell>
                            {execution.responseStatusCode}
                        </Table.Cell>
                    {:else if column.id === 'requestPath'}
                        <Table.Cell>
                            <Layout.Stack direction="row" alignItems="center" gap="s">
                                <Badge
                                    variant="secondary"
                                    type={execution.responseStatusCode >= 400 ? 'error' : 'success'}
                                    content={execution.responseStatusCode.toString()} />
                                <InlineCode code={execution.requestMethod} />
                                <InlineCode code={execution.requestPath} />
                            </Layout.Stack>
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
        </TableRow>
    {/each}
</Table.Root>
