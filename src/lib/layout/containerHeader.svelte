<script lang="ts">
    import {
        tierToPlan,
        getServiceLimit,
        type PlanServices,
        showUsageRatesModal,
        checkForUsageFees
    } from '$lib/stores/billing';
    import { tooltip } from '$lib/actions/tooltip';
    import { Alert, DropList, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { organization } from '$lib/stores/organization';
    import { isCloud } from '$lib/system';
    import { createEventDispatcher, onMount } from 'svelte';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    import { Button } from '$lib/elements/forms';

    export let isFlex = true;
    export let title: string;
    export let titleTag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h2';
    export let titleSize: '1' | '2' | '3' | '4' | '5' | '6' | '7' = '5';
    export let serviceId = title.toLocaleLowerCase() as PlanServices;
    export let total: number = null;
    export let alertType: 'info' | 'success' | 'warning' | 'error' | 'default' = 'warning';
    export let showAlert = true;

    export let buttonText: string = null;
    export let buttonMethod: () => void = null;
    export let buttonEvent: string = buttonText?.toLocaleLowerCase();
    export let buttonDisabled = false;

    let showDropdown = false;

    const limit = getServiceLimit(serviceId) || Infinity;
    const upgradeMethod = () => {
        showDropdown = false;
        wizard.start(ChangeOrganizationTierCloud);
    };
    const dispatch = createEventDispatcher();

    $: tier = tierToPlan($organization?.billingPlan)?.name;
    $: isLimited = limit !== 0 && limit < Infinity;
    $: hasUsageFees = checkForUsageFees($organization?.billingPlan, serviceId);
    $: isButtonDisabled = buttonDisabled || (isLimited && total >= limit && !hasUsageFees);

    onMount(() => {
        dispatch('data', { isButtonDisabled, limit, tier });
    });
</script>

{#if isCloud && showAlert && total && limit !== 0 && total >= limit}
    <slot name="alert" {limit} {tier} {title} {upgradeMethod} {hasUsageFees}>
        {#if hasUsageFees}
            <Alert type={alertType} isStandalone>
                <span class="text">
                    You've reached the {title.toLocaleLowerCase()} limit for the {tier} plan.
                    <button
                        class="link"
                        type="button"
                        on:click|preventDefault={() => ($showUsageRatesModal = true)}
                        >Excess usage fees will apply</button
                    >.
                </span>
            </Alert>
        {:else}
            <Alert type={alertType} isStandalone>
                <span class="text">
                    You've reached the {title.toLowerCase()} limit for the {tier} plan.

                    {#if $organization?.billingPlan === 'tier-0'}
                        <button class="link" type="button" on:click|preventDefault={upgradeMethod}
                            >Upgrade</button>
                        for additional {title.toLocaleLowerCase()}.
                    {/if}
                </span>
            </Alert>
        {/if}
    </slot>
{/if}

<header class:u-flex={isFlex} class="u-gap-12 common-section u-main-space-between u-flex-wrap">
    <div class="u-flex u-cross-child-center u-gap-16 u-flex-wrap">
        <Heading tag={titleTag} size={titleSize}>{title}</Heading>
        {#if isCloud && isLimited}
            <DropList bind:show={showDropdown} width="16">
                <Pill button on:click={() => (showDropdown = !showDropdown)}>
                    <span class="icon-info" />{title} limited
                </Pill>
                <svelte:fragment slot="list">
                    <slot name="tooltip" {limit} {tier} {title} {upgradeMethod} {hasUsageFees}>
                        {#if hasUsageFees}
                            <p class="text">
                                You are limited to {limit}
                                {title.toLocaleLowerCase()} per project on the {tier} plan.
                                <button
                                    class="link"
                                    type="button"
                                    on:click|preventDefault={() => ($showUsageRatesModal = true)}
                                    >Excess usage fees will apply</button
                                >.
                            </p>
                        {:else}
                            <p class="text">
                                Your are limited to {limit}
                                {title.toLocaleLowerCase()} per project on the {tier} plan.
                                {#if $organization?.billingPlan === 'tier-0'}<button
                                        class="link"
                                        type="button"
                                        on:click|preventDefault={upgradeMethod}>Upgrade</button>
                                    for addtional {title.toLocaleLowerCase()}.
                                {/if}
                            </p>
                        {/if}
                    </slot>
                </svelte:fragment>
            </DropList>
        {/if}
    </div>

    <slot {isButtonDisabled}>
        {#if buttonText}
            <div
                use:tooltip={{
                    content:
                        $organization.billingPlan === 'tier-0'
                            ? `Upgrade to add more ${title.toLocaleLowerCase()}`
                            : `You've reached the ${title.toLocaleLowerCase()} limit for the ${tier} plan`,
                    disabled: !isButtonDisabled
                }}>
                <Button on:click={buttonMethod} event={buttonEvent} disabled={isButtonDisabled}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">{buttonText}</span>
                </Button>
            </div>
        {/if}
    </slot>
</header>
