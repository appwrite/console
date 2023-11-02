<script lang="ts">
    import { Container } from '$lib/layout';
    import { CardGrid, Heading, ProgressBarBig } from '$lib/components';
    import { base } from '$app/paths';
    import { getServiceLimit } from '$lib/stores/billing.js';

    export let data;

    $: bandwidth = data.aggregationList.aggregations.reduce(
        (acc, curr) => acc + curr.usageBandwidth,
        0
    );

    $: users = data.aggregationList.aggregations.reduce((acc, curr) => acc + curr.usageUsers, 0);

    $: executions = data.aggregationList.aggregations.reduce(
        (acc, curr) => acc + curr.usageExecutions,
        0
    );

    $: storage = data.aggregationList.aggregations.reduce(
        (acc, curr) => acc + curr.usageStorage,
        0
    );

    $: realtime = data.aggregationList.aggregations.reduce(
        (acc, curr) => acc + curr.usageRealtime,
        0
    );
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
            <ProgressBarBig unit="GB" max={getServiceLimit('bandwidth')} used={bandwidth} />
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <Heading tag="h6" size="7">Users</Heading>

        <p class="text">The total number of users across all projects in your organization.</p>

        <svelte:fragment slot="aside">
            <ProgressBarBig unit="Users" max={getServiceLimit('users')} used={users} />
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading tag="h6" size="7">Function executions</Heading>

        <p class="text">
            Calculated for all functions that are executed in all projects in your organization.
        </p>

        <svelte:fragment slot="aside">
            <ProgressBarBig
                unit="executions"
                max={getServiceLimit('executions')}
                used={executions} />
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading tag="h6" size="7">Storage</Heading>

        <p class="text">
            Calculated for all storage operations across all projects in your organization.
        </p>

        <svelte:fragment slot="aside">
            <ProgressBarBig unit="GB" max={getServiceLimit('storage')} used={storage} />
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading tag="h6" size="7">Realtime connections</Heading>

        <p class="text">
            Calculated for all realtime concurrent connections and messages sent to all projects in
            your organization.
        </p>

        <svelte:fragment slot="aside">
            <ProgressBarBig unit="GB" max={getServiceLimit('storage')} used={realtime} />
        </svelte:fragment>
    </CardGrid>

    <p class="text common-section u-color-text-gray">
        Metrics are estimates updated every 24 hours and may not accurately reflect your invoice.
    </p>
</Container>
