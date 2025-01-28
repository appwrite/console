<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { EmptySearch, PaginationWithLimit } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    // import { getServiceLimit } from '$lib/stores/billing';
    import { writable } from 'svelte/store';
    import type { Column } from '$lib/helpers/types';
    import Table from './table.svelte';
    import Empty from '$lib/components/empty.svelte';
    import { queries } from '$lib/components/filters';

    export let data;

    // const logs = getServiceLimit('logs');

    const columns = writable<Column[]>([
        { id: '$id', title: 'Log ID', type: 'string', show: true, width: 150 },
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
            id: 'requestPath',
            title: 'Path',
            type: 'string',
            show: true,
            width: 90,
            format: 'string'
        }
    ]);
    let search = '';

    onMount(() => {
        return sdk.forConsole.client.subscribe('console', (response) => {
            if (response.events.includes('sites.*.executions.*')) {
                invalidate(Dependencies.EXECUTIONS);
            }
        });
    });
</script>

<Container>
    <!-- <SearchQuery search={data.search} placeholder="Search by path"></SearchQuery> -->
    <!-- <ContainerHeader title="Executions">
        <svelte:fragment slot="tooltip" let:tier let:limit let:upgradeMethod>
            <p class="u-bold">The {tier} plan has limits</p>
            <ul>
                <li>
                    {abbreviateNumber(limit)} sites logs
                </li>
                <li>
                    {hoursToDays(logs)} of logs
                </li>
            </ul>
            {#if $organization?.billingPlan === BillingPlan.FREE}
                <p class="text">
                    <Link on:click={upgradeMethod}>Upgrade</Link>
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
    </ContainerHeader> -->

    <!-- {#if !data.site?.logging}
        <div class="common-section">
            <Alert type="info" isStandalone>
                <svelte:fragment slot="title">Your execution logs are disabled</svelte:fragment>
                To view execution logs and errors, enable them in your
                <a
                    href={`${base}/project-${$project.$id}/functions/function-${data.site.$id}/settings`}
                    class="link">
                    Function settings</a
                >.
            </Alert>
        </div>
    {/if} -->
    {#if data?.logs?.total}
        <Table columns={$columns} logs={data.logs} />

        <PaginationWithLimit
            name="Logs"
            limit={data.limit}
            offset={data.offset}
            total={data.logs.total} />
    {:else if data?.query}
        <EmptySearch hidePages bind:search>
            <svelte:fragment slot="actions">
                <Button
                    secondary
                    on:click={() => {
                        queries.clearAll();
                        queries.apply();
                    }}>Clear filters</Button>
            </svelte:fragment>
        </EmptySearch>
    {:else}
        <Empty single target="execution"></Empty>
    {/if}
</Container>
