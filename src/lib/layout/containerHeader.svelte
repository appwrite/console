<script lang="ts">
    import { Alert, DropList, Heading } from '$lib/components';
    import { BillingPlan } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        checkForProjectLimitation,
        checkForUsageFees,
        getServiceLimit,
        readOnly,
        showUsageRatesModal,
        tierToPlan,
        upgradeURL,
        type PlanServices
    } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
    import { createEventDispatcher, onMount } from 'svelte';
    import { ContainerButton } from '.';
    import { trackEvent } from '$lib/actions/analytics';
    import { goto } from '$app/navigation';

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
    export let buttonHref: string = null;
    export let buttonEvent: string = buttonText?.toLocaleLowerCase();
    export let buttonDisabled = false;

    let showDropdown = false;

    // TODO: remove the default billing limits when backend is updated with billing code
    const { bandwidth, documents, storage, users, executions } = $organization?.billingLimits ?? {
        bandwidth: 1,
        documents: 1,
        storage: 1,
        users: 1,
        executions: 1
    };
    const limitedServices = [
        { name: 'bandwidth', value: bandwidth },
        { name: 'documents', value: documents },
        { name: 'storage', value: storage },
        { name: 'users', value: users },
        { name: 'executions', value: executions }
    ];

    const limit = getServiceLimit(serviceId) || Infinity;

    //TODO: refactor this to be a string
    const upgradeMethod = () => {
        showDropdown = false;
        goto($upgradeURL);
    };
    const dispatch = createEventDispatcher();

    $: tier = tierToPlan($organization?.billingPlan)?.name;
    $: hasProjectLimitation =
        checkForProjectLimitation(serviceId) && $organization?.billingPlan === BillingPlan.FREE;
    $: hasUsageFees = hasProjectLimitation
        ? checkForUsageFees($organization?.billingPlan, serviceId)
        : false;
    $: isLimited = limit !== 0 && limit < Infinity;
    $: overflowingServices = limitedServices.filter((service) => service.value > 0);
    $: isButtonDisabled =
        buttonDisabled ||
        ($readOnly && !GRACE_PERIOD_OVERRIDE) ||
        (isLimited && total >= limit && !hasUsageFees);

    onMount(() => {
        dispatch('data', { isButtonDisabled, limit, tier });
    });

    // on free plan, if the only db is deleted,
    // `create database` button needs to be enabled again.
    $: if (isLimited) dispatch('data', { isButtonDisabled, limit, tier });
</script>

<!-- Show only if on Cloud, alerts are enabled, and it isn't a project limited service -->
{#if isCloud && showAlert}
    <!-- some services are above limit -->
    {@const services = overflowingServices
        .map((s) => {
            return s.name.toLocaleLowerCase();
        })
        .join(', ')}

    {#if services.length}
        <slot name="alert" {limit} {tier} {title} {upgradeMethod} {hasUsageFees} {services}>
            {#if $organization?.billingPlan !== BillingPlan.FREE && hasUsageFees}
                <Alert type="info" isStandalone>
                    <span class="text">
                        You've reached the {services} limit for the {tier} plan.
                        <Button link on:click={() => ($showUsageRatesModal = true)}
                            >Excess usage fees will apply</Button
                        >.
                    </span>
                </Alert>
            {:else}
                <Alert type={alertType} isStandalone>
                    <span class="text">
                        You've reached the {services} limit for the {tier} plan. <Button
                            link
                            href={$upgradeURL}
                            on:click={() =>
                                trackEvent('click_organization_upgrade', {
                                    from: 'button',
                                    source: 'inline_alert'
                                })}>Upgrade</Button> your organization for additional resources.
                    </span>
                </Alert>
            {/if}
        </slot>
    {/if}
{/if}

<header class:u-flex={isFlex} class="u-gap-12 common-section u-main-space-between u-flex-wrap">
    <div class="u-flex u-cross-child-center u-cross-center u-gap-16 u-flex-wrap">
        <Heading tag={titleTag} size={titleSize}>{title}</Heading>
        {#if isCloud && isLimited}
            <DropList bind:show={showDropdown} width="16">
                {#if hasProjectLimitation}
                    <Pill button on:click={() => (showDropdown = !showDropdown)}>
                        <span class="icon-info" />{total}/{limit} created
                    </Pill>
                {:else if $organization?.billingPlan !== BillingPlan.SCALE}
                    <Pill button on:click={() => (showDropdown = !showDropdown)}>
                        <span class="icon-info" />Limits applied
                    </Pill>
                {/if}
                <svelte:fragment slot="list">
                    <slot name="tooltip" {limit} {tier} {title} {upgradeMethod} {hasUsageFees}>
                        {#if hasProjectLimitation}
                            <p class="text">
                                You are limited to {limit}
                                {title.toLocaleLowerCase()} per project on the {tier} plan.
                                {#if $organization?.billingPlan === BillingPlan.FREE}<Button
                                        link
                                        href={$upgradeURL}
                                        on:click={() =>
                                            trackEvent('click_organization_upgrade', {
                                                from: 'button',
                                                source: 'resource_limit_tag'
                                            })}>Upgrade</Button>
                                    for additional {title.toLocaleLowerCase()}.
                                {/if}
                            </p>
                        {:else if hasUsageFees}
                            <p class="text">
                                You are limited to {limit}
                                {title.toLocaleLowerCase()} per organization on the {tier} plan.
                                <Button link on:click={() => ($showUsageRatesModal = true)}
                                    >Excess usage fees will apply</Button
                                >.
                            </p>
                        {:else}
                            <p class="text">
                                You are limited to {limit}
                                {title.toLocaleLowerCase()} per organization on the {tier} plan.
                                {#if $organization?.billingPlan === BillingPlan.FREE}
                                    <Button link href={$upgradeURL}>Upgrade</Button>
                                    for additional {title.toLocaleLowerCase()}.
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
            <ContainerButton
                {title}
                disabled={isButtonDisabled}
                {buttonText}
                {buttonEvent}
                {buttonMethod}
                {buttonHref} />
        {/if}
    </slot>
</header>
