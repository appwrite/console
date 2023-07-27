<script lang="ts">
    import { tierToPlan, type Tier } from '$lib/stores/billing';
    import { tooltip } from '$lib/actions/tooltip';
    import { Alert, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { organization } from '$lib/stores/organization';
    import { isCloud } from '$lib/system';
    import { tick } from 'svelte';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    import { limitRates } from '$lib/constants';

    export let title: string;
    export let serviceId = title.toLocaleLowerCase();
    export let totalUse: number = null;

    let tooltipContent: HTMLDivElement;

    $: limit = limitRates?.[$organization?.billingPlan]?.find((l) => l.id === serviceId)?.amount;

    $: tier = tierToPlan($organization?.billingPlan as Tier)?.name;
</script>

{#if isCloud && totalUse && limit !== 'unlimited' && limit <= totalUse}
    <Alert type="warning">
        <span class="text">
            You've reached the maximum number of {title.toLowerCase()} for the {tier} plan.
            <button
                class="link"
                type="button"
                on:click|preventDefault={() => wizard.start(ChangeOrganizationTierCloud)}
                >Upgrade</button>
            for additional {title.toLocaleLowerCase()}.
        </span>
    </Alert>
{/if}

<div class="u-flex u-gap-12 common-section u-main-space-between">
    <div class="u-flex u-cross-child-center u-gap-16">
        <Heading tag="h2" size="5">{title}</Heading>
        {#if isCloud}
            <div
                use:tooltip={{
                    interactive: true,
                    allowHTML: true,
                    trigger: 'click',
                    onShow(instance) {
                        tick().then(() => {
                            instance.setContent(tooltipContent);
                        });
                    }
                }}>
                <Pill button>
                    <span class="icon-info" />{title} limited
                </Pill>
            </div>
        {/if}
    </div>

    <slot />
</div>

{#if isCloud}
    <div class="u-hide">
        <div bind:this={tooltipContent}>
            <p class="text">
                Your are limited to {limit}
                {title.toLocaleLowerCase()} per project on the {tier}.
                <button
                    class="link"
                    type="button"
                    on:click|preventDefault={() => wizard.start(ChangeOrganizationTierCloud)}
                    >Upgrade</button>
                for addtional {title.toLocaleLowerCase()}.
            </p>
        </div>
    </div>
{/if}
