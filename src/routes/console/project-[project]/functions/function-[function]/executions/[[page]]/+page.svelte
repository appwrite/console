<script lang="ts">
    import { Container } from '$lib/layout';
    import { Pill } from '$lib/elements';
    import { Copy, Status, Heading, Pagination, EmptySearch } from '$lib/components';
    import {
        Table,
        TableHeader,
        TableBody,
        TableCellHead,
        TableCell,
        TableCellText,
        TableRow
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { log } from '$lib/stores/logs';
    import { func } from '../../store';
    import type { PageData } from './$types';
    import { Dependencies, PAGE_LIMIT } from '$lib/constants';
    import { page } from '$app/stores';
    import { onDestroy, onMount } from 'svelte';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import CreateDeployment from '../../create.svelte';

    export let data: PageData;
    let showCreate = false;

    let unsubscribe: { (): void };

    onMount(() => {
        unsubscribe = sdkForConsole.client.subscribe('console', (response) => {
            if (response.events.includes('functions.*.executions.*')) {
                invalidate(Dependencies.EXECUTIONS);
            }
        });
    });

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Logs</Heading>
    </div>
    {#if data.executions.total}
        <Table>
            <TableHeader>
                <TableCellHead width={90}>Execution ID</TableCellHead>
                <TableCellHead width={140}>Created</TableCellHead>
                <TableCellHead width={110}>Status</TableCellHead>
                <TableCellHead width={110}>Trigger</TableCellHead>
                <TableCellHead width={80}>Duration</TableCellHead>
                <TableCellHead width={40} />
            </TableHeader>
            <TableBody>
                {#each data.executions.executions as execution}
                    <TableRow>
                        <TableCell title="Execution ID">
                            <Copy value={execution.$id}>
                                <Pill button trim>
                                    <span class="icon-duplicate" aria-hidden="true" />
                                    <span class="text u-trim">{execution.$id}</span>
                                </Pill>
                            </Copy>
                        </TableCell>
                        <TableCellText title="Created">
                            {toLocaleDateTime(execution.$createdAt)}
                        </TableCellText>
                        <TableCellText title="Status">
                            <Status status={execution.status}>
                                {execution.status} ({execution.statusCode})
                            </Status>
                        </TableCellText>
                        <TableCellText title="Trigger">
                            <Pill>
                                <span class="text u-trim">{execution.trigger}</span>
                            </Pill>
                            <Pill>
                                <span class="text u-trim">{execution.method}</span>
                            </Pill>
                        </TableCellText>
                        <TableCellText title="Duration">
                            {calculateTime(execution.duration)}</TableCellText>
                        <TableCell>
                            <Button
                                secondary
                                on:click={() => {
                                    $log.show = true;
                                    $log.func = $func;
                                    $log.data = execution;
                                }}>
                                Logs
                            </Button>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {data.executions.total}</p>
            <Pagination
                limit={PAGE_LIMIT}
                path={`/console/project-${$page.params.project}/functions/function-${$page.params.function}/executions`}
                offset={data.offset}
                sum={data.executions.total} />
        </div>
    {:else}
        <EmptySearch>
            <div class="u-text-center">
                <p class="text u-line-height-1-5">
                    You have no execution logs. Create and activate a deployment to see it here.
                </p>
                <p class="text u-line-height-1-5">Need a hand? Check out our documentation</p>
            </div>
            <div class="u-flex u-gap-16">
                <Button text external href="https://appwrite.io/docs/functions#execute">
                    Documentation
                </Button>
                <Button secondary on:click={() => (showCreate = true)}>Create deployment</Button>
            </div>
        </EmptySearch>
    {/if}
</Container>

<CreateDeployment bind:showCreate />
