<script lang="ts">
    import { Alert, EmptySearch, PaginationWithLimit, ViewSelector } from '$lib/components';
    import { BillingPlan } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { hoursToDays } from '$lib/helpers/date';
    import { Container, ContainerHeader } from '$lib/layout';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import { organization } from '$lib/stores/organization';
    import { getServiceLimit, showUsageRatesModal } from '$lib/stores/billing';
    import { project } from '$routes/(console)/project-[region]-[project]/store';
    import Create from '../create.svelte';
    import { abbreviateNumber } from '$lib/helpers/numbers';
    import { base } from '$app/paths';
    import { Filters, queries } from '$lib/components/filters';
    import { writable } from 'svelte/store';
    import type { Column } from '$lib/helpers/types';
    import { View } from '$lib/helpers/load';
    import Table from './table.svelte';
    import QuickFilters from './quickFilters.svelte';
    import { Pill } from '$lib/elements';
    import { tags } from '$lib/components/filters/store';

    export let data;

    const logs = getServiceLimit('logs');

    const columns = writable<Column[]>([
        { id: '$id', title: 'Execution ID', type: 'string', show: true, width: 150 },
        {
            id: 'status',
            title: 'Status',
            type: 'enum',
            show: true,
            width: 130,
            array: true,
            format: 'enum',
            elements: ['completed', 'failed', 'waiting', 'scheduled', 'processing', 'cancelled']
        },
        {
            id: '$createdAt',
            title: 'Created',
            type: 'datetime',
            show: true,
            width: 120,
            format: 'datetime',
            elements: [
                {
                    value: 5 * 60 * 1000,
                    label: 'last 5 minutes'
                },
                {
                    value: 60 * 60 * 1000,
                    label: 'last 1 hour'
                },
                {
                    value: 24 * 60 * 60 * 1000,
                    label: 'last 24 hours'
                }
            ]
        },
        {
            id: 'trigger',
            title: 'Trigger',
            type: 'string',
            show: false,
            width: 90,
            array: true,
            format: 'enum',
            elements: [
                { value: 'http', label: 'HTTP' },
                { value: 'schedule', label: 'Schedule' },
                { value: 'event', label: 'Event' }
            ]
        },
        {
            id: 'requestMethod',
            title: 'Method',
            type: 'string',
            show: true,
            width: 70,
            array: true,
            format: 'enum',
            elements: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        },
        {
            id: 'responseStatusCode',
            title: 'Status code',
            type: 'integer',
            show: true,
            width: 100,
            format: 'integer',
            elements: [
                {
                    value: 299,
                    label: 'Success (200-299)'
                },
                {
                    value: 399,
                    label: 'Redirect (300-399)'
                },
                {
                    value: 499,
                    label: 'Client error (400-499)'
                },
                {
                    value: 599,
                    label: 'Server error (500-599)'
                }
            ]
        },
        {
            id: 'requestPath',
            title: 'Path',
            type: 'string',
            show: true,
            width: 90,
            format: 'string'
        },
        {
            id: 'duration',
            title: 'Duration',
            type: 'integer',
            show: true,
            width: 80,
            format: 'integer',
            elements: [
                {
                    value: 1,
                    label: 'more than 1 second'
                },
                {
                    value: 5,
                    label: 'more than 5 seconds'
                },
                {
                    value: 30,
                    label: 'more than 30 seconds'
                }
            ]
        }
    ]);

    let showMobileFilters = false;
    onMount(() => {
        data?.query ? (showMobileFilters = true) : (showMobileFilters = false);
    });

    function clearAll() {
        queries.clearAll();
        queries.apply();
    }
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
        <div class="u-flex u-gap-8 u-cross-center u-flex-wrap">
            <QuickFilters {columns} />
            <Filters query={data.query} {columns} let:disabled let:toggle clearOnClick>
                <div class="u-flex u-gap-4">
                    <Button
                        text
                        on:click={toggle}
                        {disabled}
                        ariaLabel="open filter"
                        noMargin={!$tags?.length}>
                        <span class="icon-filter-line" />
                        <span class="text">More filters</span>
                    </Button>
                    {#if $tags?.length}
                        <div
                            style="flex-basis: 1px; background-color: hsl(var(--color-border)); width: 1px;">
                        </div>
                        <Button text on:click={clearAll}>Clear All</Button>
                    {/if}
                </div>
            </Filters>
        </div>
        <div class="u-flex u-gap-16">
            <ViewSelector view={View.Table} {columns} hideView allowNoColumns hideText />
            <Button
                event="execute_function"
                href={`${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}/executions/execute-function`}
                disabled={!$func.$id || !$func?.deployment}>
                <span class="text">Execute</span>
            </Button>
        </div>
    </div>
    <div class="is-only-mobile">
        <div class="u-flex u-main-space-between u-margin-block-start-16">
            <Button
                text
                on:click={() => (showMobileFilters = !showMobileFilters)}
                ariaLabel="toggle filters"
                noMargin>
                <span class="icon-filter-line" />
                <span class="text">Filters</span>
            </Button>

            <div class=" u-flex u-gap-16">
                <ViewSelector view={View.Table} {columns} hideView allowNoColumns />
                <Button
                    event="execute_function"
                    href={`${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}/executions/execute-function`}
                    disabled={!$func.$id || !$func?.deployment}>
                    <span class="text">Execute</span>
                </Button>
            </div>
        </div>
        <div
            class:u-hide={!showMobileFilters}
            class:u-flex={showMobileFilters}
            class=" u-gap-8 u-flex-wrap u-margin-block-start-16">
            <QuickFilters {columns} />

            <Filters query={data.query} {columns} clearOnClick>
                <svelte:fragment slot="mobile" let:disabled let:toggle>
                    <Pill
                        button
                        on:click={toggle}
                        {disabled}
                        class="u-flex u-gap-4 u-cross-center"
                        style="--p-tag-content-height: auto">
                        <!-- <span class="icon-filter-line" /> -->
                        <span class="text">More filters</span>
                        <span class="icon-cheveron-down" />
                    </Pill>
                </svelte:fragment>
            </Filters>
        </div>
    </div>

    {#if !$func.logging}
        <div class="common-section">
            <Alert type="info" isStandalone>
                <svelte:fragment slot="title">Your execution logs are disabled</svelte:fragment>
                To view execution logs and errors, enable them in your
                <a
                    href={`${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}/settings`}
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
    {:else if data?.query}
        <EmptySearch hidePages>
            <div class="common-section">
                <div class="u-text-center common-section">
                    <b class="body-text-2 u-bold">Sorry we couldn't find any executions</b>
                    <p>There are no executions that match your filters.</p>
                </div>
                <div class="u-flex u-gap-16 common-section u-main-center">
                    <Button
                        secondary
                        on:click={() => {
                            queries.clearAll();
                            queries.apply();
                        }}>Clear filters</Button>
                </div>
            </div>
        </EmptySearch>
    {:else}
        <EmptySearch>
            <div class="u-text-center">
                <p class="text u-line-height-1-5">
                    You have no execution logs. Create and activate a deployment to see it here.
                </p>
                <p class="text u-line-height-1-5">Need a hand? Learn more in our documentation.</p>
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
