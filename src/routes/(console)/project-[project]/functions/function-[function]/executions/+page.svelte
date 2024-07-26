<script lang="ts">
    import { afterNavigate, invalidate } from '$app/navigation';
    import { Alert, EmptySearch, PaginationWithLimit, ViewSelector } from '$lib/components';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Button, FormList, InputSelect } from '$lib/elements/forms';
    import { hoursToDays } from '$lib/helpers/date';
    import { Container, ContainerHeader } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import { organization } from '$lib/stores/organization';
    import { getServiceLimit, showUsageRatesModal } from '$lib/stores/billing';
    import { project } from '$routes/(console)/project-[project]/store';
    import Create from '../create.svelte';
    import { abbreviateNumber } from '$lib/helpers/numbers';
    import { base } from '$app/paths';
    import { Filters, queries, TagList } from '$lib/components/filters';
    import { writable } from 'svelte/store';
    import type { Column } from '$lib/helpers/types';
    import { View } from '$lib/helpers/load';
    import Table from './table.svelte';
    import { addFilter, tags, ValidOperators } from '$lib/components/filters/store';
    import QuickFilters from './quickFilters.svelte';
    import InputText from '$lib/elements/forms/inputText.svelte';
    import { Pill } from '$lib/elements';

    export let data;

    const logs = getServiceLimit('logs');

    const columns = writable<Column[]>([
        { id: '$id', title: 'Execution ID', type: 'string', show: true, width: 150 },
        {
            id: 'status',
            title: 'Status',
            type: 'enum',
            show: true,
            width: 110,
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

    const pathColumn = $columns.find((col) => col.id === 'requestPath');
    let pathQuery: string;
    const idColumn = $columns.find((col) => col.id === '$id');
    let idQuery: string;
    const durationColumn = $columns.find((col) => col.id === 'duration');
    const durationOptions = [
        ...durationColumn.elements,
        {
            value: null,
            label: 'Select duration'
        }
    ] as { value: string; label: string }[];
    let durationQuery: string = null;

    let showMobileFilters = false;
    onMount(() => {
        data?.query ? (showMobileFilters = true) : (showMobileFilters = false);
        return sdk.forConsole.client.subscribe('console', (response) => {
            if (response.events.includes('functions.*.executions.*')) {
                invalidate(Dependencies.EXECUTIONS);
            }
        });
    });
    let tagCount: number;
    afterNavigate(() => {
        pathQuery = '';
        idQuery = '';
        tagCount = $tags?.length;
    });

    function applyFilters() {
        if (pathQuery) {
            const tagList = $tags.filter((tag) => tag.tag.includes(pathColumn.title));
            tagList.forEach((tag) => queries.removeFilter(tag));
            addFilter($columns, pathColumn.id, ValidOperators.StartsWith, pathQuery);
        }
        if (idQuery) {
            const tagList = $tags.filter((tag) => tag.tag.includes(idColumn.title));
            tagList.forEach((tag) => queries.removeFilter(tag));
            addFilter($columns, idColumn.id, ValidOperators.StartsWith, idQuery);
        }
        if (durationQuery) {
            const tagList = $tags.filter((tag) => tag.tag.includes(durationColumn.title));
            tagList.forEach((tag) => queries.removeFilter(tag));
            addFilter($columns, durationColumn.id, ValidOperators.GreaterThan, durationQuery);
        }
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
            <Filters
                query={data.query}
                {columns}
                let:disabled
                let:toggle
                quickFilters
                clearOnClick
                enableApply={!!pathQuery || !!idQuery || !!durationQuery}
                on:apply={applyFilters}
                on:toggle={() => {
                    pathQuery = idQuery = '';
                    durationQuery = null;
                }}>
                <div class="u-flex u-gap-4">
                    <Button text on:click={toggle} {disabled} noMargin ariaLabel="open filter">
                        <span class="icon-filter-line" />
                        <span class="text">More filters</span>
                        {#if tagCount}
                            <span class="inline-tag">{tagCount}</span>
                        {/if}
                    </Button>
                </div>
                <svelte:fragment slot="quick">
                    <p>Apply <b>quick</b> filter rules to refine the table view</p>
                    <form on:submit|preventDefault class="u-margin-block-start-16">
                        <FormList gap={16}>
                            <InputText
                                bind:value={pathQuery}
                                label={pathColumn.title}
                                id={pathColumn.id}
                                placeholder="/" />
                            <InputSelect
                                id={durationColumn.id}
                                label={durationColumn.title}
                                options={durationOptions}
                                bind:value={durationQuery} />
                            <InputText
                                bind:value={idQuery}
                                label={idColumn.title}
                                id={idColumn.id}
                                placeholder="Enter ID" />
                        </FormList>
                    </form>
                    <ul class="u-flex u-flex-wrap u-cross-center u-gap-8 u-margin-block-start-16">
                        <TagList />
                    </ul>
                </svelte:fragment>
            </Filters>
        </div>
        <div class="u-flex u-gap-16">
            <ViewSelector view={View.Table} {columns} hideView allowNoColumns hideText />
            <Button
                event="execute_function"
                href={`${base}/project-${$project.$id}/functions/function-${$func.$id}/executions/execute-function`}
                disabled={!$func.$id || !$func?.deployment}>
                <span class="icon-plus" aria-hidden="true" />
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
                    href={`${base}/project-${$project.$id}/functions/function-${$func.$id}/executions/execute-function`}
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

            <Filters
                query={data.query}
                {columns}
                quickFilters
                clearOnClick
                enableApply={!!pathQuery || !!idQuery || !!durationQuery}
                on:apply={applyFilters}
                on:toggle={() => {
                    pathQuery = idQuery = '';
                    durationQuery = null;
                }}>
                <svelte:fragment slot="mobile" let:disabled let:toggle>
                    <Pill
                        button
                        on:click={toggle}
                        {disabled}
                        class="u-flex u-gap-4 u-cross-center"
                        style="--p-tag-content-height: auto">
                        <!-- <span class="icon-filter-line" /> -->
                        <span class="text">More filters</span>
                        {#if tagCount}
                            <span class="inline-tag">{tagCount}</span>
                        {/if}
                        <span class="icon-cheveron-down" />
                    </Pill>
                </svelte:fragment>
                <svelte:fragment slot="quick">
                    <p>Apply <b>quick</b> filter rules to refine the table view</p>
                    <form on:submit|preventDefault class="u-margin-block-start-16">
                        <FormList gap={16}>
                            <InputText
                                bind:value={pathQuery}
                                label={pathColumn.title}
                                id={pathColumn.id}
                                placeholder="/" />
                            <InputSelect
                                id={durationColumn.id}
                                label={durationColumn.title}
                                options={durationOptions}
                                bind:value={durationQuery} />
                            <InputText
                                bind:value={idQuery}
                                label={idColumn.title}
                                id={idColumn.id}
                                placeholder="Enter ID" />
                        </FormList>
                    </form>
                    <ul class="u-flex u-flex-wrap u-cross-center u-gap-8 u-margin-block-start-16">
                        <TagList />
                    </ul>
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
                    href={`${base}/project-${$project.$id}/functions/function-${$func.$id}/settings`}
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
