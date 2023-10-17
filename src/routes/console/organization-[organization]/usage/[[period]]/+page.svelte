<script lang="ts">
    import { Container } from '$lib/layout';
    import { CardGrid, Heading, ProgressBarBig } from '$lib/components';
    import { organization } from '$lib/stores/organization';
    import { usageRates } from '$lib/constants';
    import { base } from '$app/paths';

    export let data;

    $: rates = usageRates[$organization.billingPlan];

    $: bandwidth = data.aggregationList.aggregations.reduce(
        (acc, curr) => acc + curr.usageBandwidth,
        0
    );
    $: bandwidthLimit = rates.filter((r) => r.resource === 'Bandwidth')[0].amount;

    $: users = data.aggregationList.aggregations.reduce((acc, curr) => acc + curr.usageUsers, 0);
    $: usersLimit = rates.filter((r) => r.resource === 'Active users')[0].amount;

    $: executions = data.aggregationList.aggregations.reduce(
        (acc, curr) => acc + curr.usageExecutions,
        0
    );
    $: executionsLimit = rates.filter((r) => r.resource === 'Function executions')[0].amount;

    $: storage = data.aggregationList.aggregations.reduce(
        (acc, curr) => acc + curr.usageStorage,
        0
    );
    $: storageLimit = rates.filter((r) => r.resource === 'Storage')[0].amount;

    $: realtime = data.aggregationList.aggregations.reduce(
        (acc, curr) => acc + curr.usageRealtime,
        0
    );
    $: realtimeLimit = rates.filter((r) => r.resource === 'Concurrent connections')[0].amount;
</script>

<Container>
    <Heading tag="h2" size="5">Usage</Heading>
    <div class="u-flex u-main-space-between common-section">
        <p class="text">
            If you exceed the limits of the Starter plan, services for your projects may be
            disrupted. <a href={`${base}/console/`}>Upgrade for greater capacity</a>.
        </p>
        <div class="u-flex u-gap-8">
            <p class="text">Usage period:</p>

            JANUARY 2021
        </div>
    </div>

    <CardGrid>
        <Heading tag="h6" size="7">Bandwidth</Heading>

        <p class="text">
            Calculated for all bandwidth used across all projects in your organization.
        </p>

        <svelte:fragment slot="aside">
            <ProgressBarBig unit="TB" max={bandwidthLimit} used={bandwidth} />
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <Heading tag="h6" size="7">Active users</Heading>

        <p class="text">Active users across all projects in your organization.</p>

        <svelte:fragment slot="aside">
            <ProgressBarBig unit="AU" max={usersLimit} used={users} />
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading tag="h6" size="7">Function executions</Heading>

        <p class="text">
            Calculated for all functions that are executed in all projects in your organization.
        </p>

        <svelte:fragment slot="aside">
            <ProgressBarBig unit="executions" max={executionsLimit} used={executions} />
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading tag="h6" size="7">Storage</Heading>

        <p class="text">
            Calculated for all storage operations across all projects in your organization.
        </p>

        <svelte:fragment slot="aside">
            <ProgressBarBig unit="GB" max={storageLimit} used={storage} />
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading tag="h6" size="7">Realtime connections</Heading>

        <p class="text">
            Calculated for all realtime concurrent connections and messages sent to all projects in
            your organization.
        </p>

        <svelte:fragment slot="aside">
            <ProgressBarBig unit="GB" max={realtimeLimit} used={realtime} />
        </svelte:fragment>
    </CardGrid>

    <p class="text common-section u-color-text-gray">
        Metrics are estimates updated every 24 hours and may not accurately reflect your invoice.
    </p>
</Container>
