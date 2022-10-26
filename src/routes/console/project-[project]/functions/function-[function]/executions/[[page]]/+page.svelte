<script lang="ts">
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { Copy, Empty, Status, Heading, Pagination } from '$lib/components';
    import {
        Table,
        TableHeader,
        TableBody,
        TableCellHead,
        TableCell,
        TableCellText,
        TableRowButton
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { log } from '$lib/stores/logs';
    import { func } from '../../store';
    import type { PageData } from './$types';
    import { PAGE_LIMIT } from '$lib/constants';
    import { page } from '$app/stores';

    export let data: PageData;

    //TODO: add optional hover state to rows
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Logs</Heading>
    </div>
    {#if data.executions.total}
        <Table>
            <TableHeader>
                <TableCellHead>Deployment ID</TableCellHead>
                <TableCellHead width={140}>Created</TableCellHead>
                <TableCellHead width={110}>Status</TableCellHead>
                <TableCellHead width={90}>Trigger</TableCellHead>
                <TableCellHead width={70}>Type</TableCellHead>
                <TableCellHead width={100}>Build Time</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each data.executions.executions as execution}
                    <TableRowButton
                        on:click={() => {
                            $log.show = true;
                            $log.func = $func;
                            $log.data = execution;
                        }}>
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
                        <TableCellText title="Status">
                            <Status status={execution.status}>
                                {execution.status}
                            </Status>
                        </TableCellText>
                        <TableCellText title="Trigger">
                            <Pill>
                                <span class="text u-trim">{execution.trigger}</span>
                            </Pill>
                        </TableCellText>
                        <TableCellText title="Type">TBI</TableCellText>
                        <TableCellText title="Duration">
                            {calculateTime(execution.duration)}</TableCellText>
                    </TableRowButton>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <Empty isButton single>
            <p>Execute your function to view execution logs</p>
            <Button external secondary href="#">Documentation</Button>
        </Empty>
    {/if}
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {data.executions.total}</p>
        <Pagination
            limit={PAGE_LIMIT}
            path={`/console/project-${$page.params.project}/functions/function-${$page.params.function}/executions`}
            offset={data.offset}
            sum={data.executions.total} />
    </div>
</Container>
