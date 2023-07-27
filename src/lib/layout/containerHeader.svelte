<script lang="ts">
    import { tierToPlan, type Tier, getServiceLimit } from '$lib/stores/billing';
    import { tooltip } from '$lib/actions/tooltip';
    import { Alert, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { organization } from '$lib/stores/organization';
    import { isCloud } from '$lib/system';
    import { tick } from 'svelte';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    import { Button } from '$lib/elements/forms';

    export let isFlex = true;
    export let title: string;
    export let titleTag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h2';
    export let titleSize: '1' | '2' | '3' | '4' | '5' | '6' | '7' = '5';
    export let serviceId = title.toLocaleLowerCase();
    export let total: number = null;

    export let buttonText: string = null;
    export let buttonMethod: () => void = null;
    export let buttonEvent: string = buttonText?.toLocaleLowerCase();

    let tooltipContent: HTMLDivElement;

    const limit = getServiceLimit(serviceId)?.amount ?? Infinity;

    $: tier = tierToPlan($organization?.billingPlan as Tier)?.name;
</script>

{#if isCloud && total && limit !== 'unlimited' && total >= limit}
    <slot name="alert">
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
    </slot>
{/if}

<div class:u-flex={isFlex} class=" u-gap-12 common-section u-main-space-between">
    <div class="u-flex u-cross-child-center u-gap-16">
        <Heading tag={titleTag} size={titleSize}>{title}</Heading>
        {#if isCloud && limit !== 'unlimited' && limit < Infinity}
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

    <slot>
        {#if buttonText}
            <div
                use:tooltip={{
                    content: `Upgrade to add more ${title.toLocaleLowerCase()}`,
                    disabled: total < limit || limit === 'unlimited'
                }}>
                <Button
                    on:click={buttonMethod}
                    event={buttonEvent}
                    disabled={limit !== 'unlimited' && total >= limit}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">{buttonText}</span>
                </Button>
            </div>
        {/if}
    </slot>
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
