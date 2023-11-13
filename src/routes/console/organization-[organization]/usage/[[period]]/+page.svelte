<script lang="ts">
    import { Container } from '$lib/layout';
    import { CardGrid, Heading, ProgressBarBig } from '$lib/components';
    import { getServiceLimit, tierToPlan } from '$lib/stores/billing.js';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    import { wizard } from '$lib/stores/wizard.js';
    import { organization } from '$lib/stores/organization';
    import UsageRates from '$routes/console/wizard/cloudOrganization/usageRates.svelte';

    const tier = tierToPlan($organization?.billingPlan)?.name;

    export let data;
    let showRates = false;

    $: console.log(data.organizationUsage.users);
</script>

<Container>
    <Heading tag="h2" size="5">Usage</Heading>
    <div class="u-flex u-main-space-between common-section">
        {#if $organization.billingPlan === 'tier-2'}
            <p class="text">
                On the Scale plan, you'll be charged only for any usage that exceeds the thresholds
                per resource listed below. <button
                    on:click={() => (showRates = true)}
                    class="link"
                    type="button">Learn more about plan usage limits.</button>
            </p>
        {:else}
            <p class="text">
                If you exceed the limits of the {tier} plan, services for your projects may be disrupted.
                <button
                    on:click={() => wizard.start(ChangeOrganizationTierCloud)}
                    class="link"
                    type="button">Upgrade for greater capacity</button
                >.
            </p>
        {/if}
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
            <ProgressBarBig
                unit="GB"
                max={getServiceLimit('bandwidth')}
                used={data.organizationUsage.bandwidth[0]} />
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading tag="h6" size="7">Users</Heading>

        <p class="text">The total number of users across all projects in your organization.</p>

        <svelte:fragment slot="aside">
            <ProgressBarBig
                unit="Users"
                max={getServiceLimit('users')}
                used={data.organizationUsage.bandwidth[0]} />
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
                used={data.organizationUsage.executions} />
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading tag="h6" size="7">Storage</Heading>

        <p class="text">
            Calculated for all storage operations across all projects in your organization.
        </p>

        <svelte:fragment slot="aside">
            <ProgressBarBig
                unit="GB"
                max={getServiceLimit('storage')}
                used={data.organizationUsage.storage} />
        </svelte:fragment>
    </CardGrid>

    <p class="text common-section u-color-text-gray">
        Metrics are estimates updated every 24 hours and may not accurately reflect your invoice.
    </p>
</Container>

<UsageRates bind:show={showRates} tier={$organization?.billingPlan} />
