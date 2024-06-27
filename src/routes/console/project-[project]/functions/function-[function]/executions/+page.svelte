<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import {
        Alert,
        DropList,
        DropListItem,
        DropListLink,
        EmptySearch,
        Id,
        PaginationWithLimit
    } from '$lib/components';
    import { BillingPlan, Dependencies } from '$lib/constants';
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
    import { hoursToDays, timeFromNow } from '$lib/helpers/date';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { Container, ContainerHeader } from '$lib/layout';
    import { log } from '$lib/stores/logs';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { func, execute, showFunctionExecute } from '../store';
    import type { Models } from '@appwrite.io/console';
    import { organization } from '$lib/stores/organization';
    import { getServiceLimit, showUsageRatesModal } from '$lib/stores/billing';
    import { project } from '$routes/console/project-[project]/store';
    import Create from '../create.svelte';
    import { abbreviateNumber } from '$lib/helpers/numbers';
    import Delete from './delete.svelte';
    import Cancel from './cancel.svelte';

    export let data;

    let showDropdown = [];
    let showDelete = false;
    let showCancel = false;

    let selectedExecution: Models.Execution = null;

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

    const logs = getServiceLimit('logs');
</script>

<Container>
    <ContainerHeader
        title="Executions"
        buttonText="Execute now"
        buttonEvent="execute_function"
        buttonMethod={() => {
            $execute = $func;
            $showFunctionExecute = true;
        }}>
        <svelte:fragment slot="tooltip" let:tier let:limit let:upgradeMethod>
            <p class="u-bold">The {tier} plan has limits</p>
            <ul>
                <li>
                    {abbreviateNumber(limit)} function executions
                </li>
                <li>
                    {hoursToDays(logs)} of logs
                </li>
            </ul>
            {#if $organization?.billingPlan === BillingPlan.FREE}
                <p class="text">
                    <button class="link" type="button" on:click|preventDefault={upgradeMethod}
                        >Upgrade</button>
                    to increase your resource limits.
                </p>
            {:else}
                <p class="text">
                    After this amount, <button
                        class="link"
                        type="button"
                        on:click|preventDefault={() => ($showUsageRatesModal = true)}
                        >usage fees will apply</button
                    >.
                </p>
            {/if}
        </svelte:fragment>
    </ContainerHeader>

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
                <TableCellHead width={40} />
            </TableHeader>
            <TableBody>
                {#each data.executions.executions as execution, index (execution.$id)}
                    <TableRowButton>
                        <TableCell width={150} title="Execution ID">
                            <Id value={execution.$id}>{execution.$id}</Id>
                        </TableCell>
                        <TableCell width={110} title="Status">
                            {@const status = execution.status}

                            <Pill
                                warning={status === 'scheduled' ||
                                    status === 'processing' ||
                                    status === 'pending'}
                                danger={status === 'failed' || status === 'cancelled'}
                                info={status === 'completed'}>
                                {#if status === 'scheduled'}
                                    <span class="icon-clock" aria-hidden="true" />
                                {/if}
                                {status}
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
                        <TableCell width={40} showOverflow>
                            <DropList
                                bind:show={showDropdown[index]}
                                placement="bottom-start"
                                noArrow>
                                <button
                                    class="button is-only-icon is-text"
                                    aria-label="More options"
                                    on:click|preventDefault={() => {
                                        showDropdown[index] = !showDropdown[index];
                                    }}>
                                    <span class="icon-dots-horizontal" aria-hidden="true" />
                                </button>
                                <svelte:fragment slot="list">
                                    {#if execution.status === 'scheduled' || execution.status === 'processing' || execution.status === 'pending'}
                                        <DropListItem
                                            icon="x-circle"
                                            on:click={() => {
                                                selectedExecution = execution;
                                                showCancel = true;
                                                showDropdown = [];
                                            }}>
                                            Cancel
                                        </DropListItem>
                                    {/if}

                                    <DropListItem
                                        icon="terminal"
                                        on:click={() => {
                                            showDropdown = [];
                                            showLogs(execution);
                                        }}>
                                        Logs
                                    </DropListItem>
                                    <DropListItem
                                        icon="trash"
                                        on:click={() => {
                                            selectedExecution = execution;
                                            showDropdown = [];
                                            showDelete = true;
                                        }}>
                                        Delete
                                    </DropListItem>
                                </svelte:fragment>
                            </DropList>
                        </TableCell>
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
                <Button text external href="https://appwrite.io/docs/products/functions/execution">
                    Documentation
                </Button>
                <Create secondary />
            </div>
        </EmptySearch>
    {/if}
</Container>

{#if selectedExecution}
    <Delete {selectedExecution} bind:showDelete />
    <Cancel {selectedExecution} bind:showCancel />
{/if}
