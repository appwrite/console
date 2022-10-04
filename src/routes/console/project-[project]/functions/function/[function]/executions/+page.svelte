<script lang="ts">
    import { page } from '$app/stores';
    import { pageLimit } from '$lib/stores/layout';
    import { executionList } from './store';
    // import type { Models } from '@aw-labs/appwrite-console';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { Pagination, Copy, Empty } from '$lib/components';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRow,
        TableCellHead,
        TableCell,
        TableCellText
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { Query } from '@aw-labs/appwrite-console';

    let search = '';
    let offset = 0;
    // let showExecute = false;
    // let selectedExecution: Models.Execution = null;
    const functionId = $page.params.function;

    $: executionList.load(functionId, [Query.offset(offset), Query.limit($pageLimit)], search);
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Logs</h2>
    </div>
    {#if $executionList?.total}
        <Table>
            <TableHeader>
                <TableCellHead>Deployment ID</TableCellHead>
                <TableCellHead width={140}>Created</TableCellHead>
                <TableCellHead width={70}>Status</TableCellHead>
                <TableCellHead width={90}>Trigger</TableCellHead>
                <TableCellHead width={70}>Type</TableCellHead>
                <TableCellHead width={100}>Build Time</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each $executionList.executions as execution}
                    <TableRow>
                        <TableCell title="Deployment ID">
                            <Copy value={execution.$id}>
                                <Pill button
                                    ><span class="icon-duplicate" aria-hidden="true" />
                                    <span class="text u-trim">{execution.$id}</span></Pill>
                            </Copy>
                        </TableCell>
                        <TableCellText title="Created">
                            {toLocaleDateTime(execution.$createdAt)}
                        </TableCellText>
                        <TableCellText title="Status">{execution.status}</TableCellText>
                        <TableCellText title="Trigger">
                            <Pill>
                                <span class="text u-trim">{execution.trigger}</span>
                            </Pill>
                        </TableCellText>
                        <TableCellText title="Type">{execution.trigger}</TableCellText>
                        <TableCellText title="Duration">
                            {calculateTime(execution.duration)}</TableCellText>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <Empty isButton on:click={() => console.log('showCreate = true')}>
            <p>Execute your function to view execution logs</p>
            <Button external secondary href="#">Documentation</Button>
        </Empty>
    {/if}
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {$executionList?.total}</p>
        <Pagination limit={$pageLimit} bind:offset sum={$executionList?.total} />
    </div>
</Container>
