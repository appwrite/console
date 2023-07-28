<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { EmptySearch, Id, PaginationWithLimit, Status } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { Container, ContainerHeader } from '$lib/layout';
    import { log } from '$lib/stores/logs';
    import { sdk } from '$lib/stores/sdk';
    import { onDestroy, onMount } from 'svelte';
    import { func } from '../store';
    import CreateDeployment from '../create.svelte';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { organization } from '$lib/stores/organization';
    import { tierToPlan, type Tier, getServiceLimit } from '$lib/stores/billing';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    import { isCloud } from '$lib/system';
    import UsageRates from '$routes/console/wizard/cloudOrganization/usageRates.svelte';

    export let data: PageData;

    let showCreate = false;
    let showRates = false;
    let unsubscribe: { (): void };

    onMount(() => {
        unsubscribe = sdk.forConsole.client.subscribe('console', (response) => {
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

    function showLogs(execution: Models.Execution) {
        $log.show = true;
        $log.func = $func;
        $log.data = execution;
    }

    const tier = tierToPlan($organization?.billingPlan as Tier)?.name;
    const executions = getServiceLimit('executions')?.amount;
    const logs = getServiceLimit('logs')?.amount;
</script>

<Container>
    <ContainerHeader title="Executions">
        <svelte:fragment slot="tooltip">
            <p class="u-bold">The {tier} plan has limits</p>
            <ul>
                <li>
                    {executions} function executions
                </li>
                <li>
                    {logs} hour of logs
                </li>
            </ul>
            {#if $organization?.billingPlan === 'tier-0'}
                <p class="text">
                    <button
                        class="link"
                        type="button"
                        on:click|preventDefault={() => wizard.start(ChangeOrganizationTierCloud)}
                        >Upgrade</button>
                    to increase your resource limits.
                </p>
            {:else}
                <p class="text">
                    After this amount, <button
                        class="link"
                        type="button"
                        on:click|preventDefault={() => (showRates = true)}
                        >usage fees will apply</button
                    >.
                </p>
            {/if}
        </svelte:fragment>
    </ContainerHeader>
    {#if data.executions.total}
        <TableScroll>
            <TableHeader>
                <TableCellHead width={150}>Execution ID</TableCellHead>
                <TableCellHead width={140}>Created</TableCellHead>
                <TableCellHead width={110}>Status</TableCellHead>
                <TableCellHead width={90}>Trigger</TableCellHead>
                <TableCellHead width={80}>Duration</TableCellHead>
                <TableCellHead width={50} />
            </TableHeader>
            <TableBody>
                {#each data.executions.executions as execution}
                    <TableRow>
                        <TableCell width={150} title="Execution ID">
                            <Id value={execution.$id}>{execution.$id}</Id>
                        </TableCell>
                        <TableCellText width={140} title="Created">
                            {toLocaleDateTime(execution.$createdAt)}
                        </TableCellText>
                        <TableCellText width={110} title="Status">
                            <Status status={execution.status}>
                                {execution.status}
                            </Status>
                        </TableCellText>
                        <TableCellText width={90} title="Trigger">
                            <Pill>
                                <span class="text u-trim">{execution.trigger}</span>
                            </Pill>
                        </TableCellText>
                        <TableCellText width={80} title="Duration">
                            {calculateTime(execution.duration)}
                        </TableCellText>
                        <TableCell width={50}>
                            <Button
                                secondary
                                event="view_logs"
                                on:click={() => showLogs(execution)}>
                                Logs
                            </Button>
                        </TableCell>
                    </TableRow>
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
                <Button secondary on:click={() => (showCreate = true)}>Create deployment</Button>
            </div>
        </EmptySearch>
    {/if}
</Container>

<CreateDeployment bind:showCreate />

{#if isCloud}
    <UsageRates bind:show={showRates} tier={$organization?.billingPlan} />
{/if}
