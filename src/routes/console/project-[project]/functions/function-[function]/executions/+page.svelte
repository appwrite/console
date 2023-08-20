<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Alert, EmptySearch, Heading, Id, PaginationWithLimit } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRowButton,
        TableScroll
    } from '$lib/elements/table';
    import { timeFromNow } from '$lib/helpers/date';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { Container } from '$lib/layout';
    import { log } from '$lib/stores/logs';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { project } from '$routes/console/project-[project]/store';
    import Create from '../create.svelte';
    import Execute from '../execute.svelte';

    export let data: PageData;

    let selectedFunction: Models.Function = null;

    onMount(() => {
        return sdk.forConsole.client.subscribe('console', (response) => {
            if (response.events.includes('functions.*.executions.*')) {
                invalidate(Dependencies.EXECUTIONS);
            }
        });
    });

    function showLogs(execution: Models.Execution) {
        $log.show = true;
        $log.func = $func;
        $log.data = execution;
    }
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Executions</Heading>

        <Button on:click={() => (selectedFunction = $func)} event="execute_function">
            <span class="text">Execute now</span>
        </Button>
    </div>
    {#if !$func.logging}
        <div class="common-section">
            <Alert type="info" isStandalone>
                <svelte:fragment slot="title">Your execution logs are disabled</svelte:fragment>

                To see the latest execution logs, enable them in your
                <a
                    href={`/console/project-${$project.$id}/functions/function-${$func.$id}/settings`}
                    class="link">
                    Function settings</a
                >.
            </Alert>
        </div>
    {/if}
    {#if data.executions.total}
        <TableScroll>
            <TableHeader>
                <TableCellHead width={150}>Execution ID</TableCellHead>
                <TableCellHead width={110}>Status</TableCellHead>
                <TableCellHead width={140}>Created</TableCellHead>
                <TableCellHead width={90}>Trigger</TableCellHead>
                <TableCellHead width={70}>Method</TableCellHead>
                <TableCellHead width={90}>Path</TableCellHead>
                <TableCellHead width={80}>Duration</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each data.executions.executions as execution}
                    <TableRowButton on:click={() => showLogs(execution)}>
                        <TableCell width={150} title="Execution ID">
                            <Id value={execution.$id}>{execution.$id}</Id>
                        </TableCell>
                        <TableCell width={110} title="Status">
                            {@const status = execution.status}
                            <Pill
                                danger={status === 'failed'}
                                warning={status === 'pending'}
                                success={status === 'completed' || status === 'ready'}
                                info={status === 'processing' || status === 'building'}>
                                <span class="text u-trim">{execution.status}</span>
                            </Pill>
                        </TableCell>
                        <TableCellText width={140} title="Created">
                            {timeFromNow(execution.$createdAt)}
                        </TableCellText>
                        <TableCell width={90} title="Trigger">
                            <Pill>
                                <span class="text u-trim">{execution.trigger}</span>
                            </Pill>
                        </TableCell>
                        <TableCellText width={70} title="Method">
                            {execution.requestMethod}
                        </TableCellText>
                        <TableCellText width={90} title="Path">
                            {execution.requestPath}
                        </TableCellText>
                        <TableCellText width={80} title="Duration">
                            {calculateTime(execution.duration)}
                        </TableCellText>
                    </TableRowButton>
                {/each}
            </TableBody>
        </TableScroll>

        <PaginationWithLimit
            name="Executions"
            limit={data.limit}
            offset={data.offset}
            total={data.executions.total} />
    {:else}
        <EmptySearch>
            <div class="u-text-center">
                <p class="text u-line-height-1-5">
                    You have no execution logs. Create and activate a deployment to see it here.
                </p>
                <p class="text u-line-height-1-5">Need a hand? Learn more in our documentation</p>
            </div>
            <div class="u-flex u-gap-16">
                <Button text external href="https://appwrite.io/docs/functions#execute">
                    Documentation
                </Button>
                <Create secondary />
            </div>
        </EmptySearch>
    {/if}
</Container>

<Execute {selectedFunction} />
