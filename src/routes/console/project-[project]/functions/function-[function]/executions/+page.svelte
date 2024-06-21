<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Alert, EmptySearch, PaginationWithLimit, ViewSelector } from '$lib/components';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { hoursToDays } from '$lib/helpers/date';
    import { Container, ContainerHeader } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import { organization } from '$lib/stores/organization';
    import { getServiceLimit, showUsageRatesModal } from '$lib/stores/billing';
    import { project } from '$routes/console/project-[project]/store';
    import Create from '../create.svelte';
    import { abbreviateNumber } from '$lib/helpers/numbers';
    import { base } from '$app/paths';
    import { Filters } from '$lib/components/filters';
    import { writable } from 'svelte/store';
    import type { Column } from '$lib/helpers/types';
    import { View } from '$lib/helpers/load';
    import Table from './table.svelte';

    export let data;

    const columns = writable<Column[]>([
        { id: '$id', title: 'Execution ID', type: 'string', show: true, width: 150 },
        { id: 'status', title: 'Status', type: 'string', show: true, width: 110 },
        { id: '$createdAt', title: 'Created', type: 'datetime', show: true, width: 140 },
        { id: 'trigger', title: 'Trigger', type: 'string', show: true, filter: false, width: 90 },
        { id: 'requestMethod', title: 'Method', type: 'string', show: true, width: 70 },
        { id: 'requestPath', title: 'Path', type: 'string', show: true, width: 90 },
        { id: 'duration', title: 'Duration', type: 'string', show: true, width: 80 }
    ]);

    onMount(() => {
        return sdk.forConsole.client.subscribe('console', (response) => {
            if (response.events.includes('functions.*.executions.*')) {
                invalidate(Dependencies.EXECUTIONS);
            }
        });
    });

    const logs = getServiceLimit('logs');
</script>

<Container>
    <ContainerHeader title="Executions">
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
    <div class="u-flex u-main-space-between is-not-mobile u-margin-block-start-16">
        <Filters query={data.query} {columns} />
        <div class="u-flex u-gap-16">
            <ViewSelector view={View.Table} {columns} hideView allowNoColumns showColsTextMobile />
            <Button
                event="execute_function"
                href={`${base}/console/project-${$project.$id}/functions/function-${$func.$id}/executions/execute-function`}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Execute now</span>
            </Button>
        </div>
    </div>

    <div class="u-flex u-flex-vertical u-gap-16 u-margin-block-start-16 is-only-mobile">
        <div class=" u-flex u-gap-16">
            <div class="u-flex-basis-50-percent">
                <ViewSelector
                    view={View.Table}
                    {columns}
                    hideView
                    allowNoColumns
                    showColsTextMobile
                    fullWidthMobile />
            </div>
            <div class="u-flex-basis-50-percent">
                <Filters query={data.query} {columns} fullWidthMobile />
            </div>
        </div>
        <Button
            event="execute_function"
            href={`${base}/console/project-${$project.$id}/functions/function-${$func.$id}/executions/execute-function`}
            fullWidthMobile>
            <span class="icon-plus" aria-hidden="true" />
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
    {#if data?.executions?.total}
        <Table columns={$columns} {data} />

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
