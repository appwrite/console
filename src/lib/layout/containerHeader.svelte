<script lang="ts">
    import { DropList } from '$lib/components';
    import { Link } from '$lib/elements';
    import { Badge, Icon } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Alert } from '@appwrite.io/pink-svelte';
    import {
        checkForProjectLimitation,
        checkForUsageFees,
        getServiceLimit,
        readOnly,
        showUsageRatesModal,
        getChangePlanUrl,
        type PlanServices,
        canUpgrade
    } from '$lib/stores/billing';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
    import { createEventDispatcher, onMount } from 'svelte';
    import { ContainerButton } from '.';
    import { goto } from '$app/navigation';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

    export let title: string;
    export let serviceId = title.toLocaleLowerCase() as PlanServices;
    export let total: number = null;
    export let alertType: 'info' | 'success' | 'warning' | 'error' = 'warning';
    export let showAlert = true;

    export let buttonText: string = null;
    export let buttonMethod: () => void = null;
    export let buttonHref: string = null;
    export let buttonEvent: string = buttonText?.toLocaleLowerCase();
    export let buttonEventData: Record<string, unknown> = {};
    export let buttonDisabled = false;

    let showDropdown = false;

    // TODO: remove the default billing limits when backend is updated with billing code
    const { bandwidth, storage, users, executions } = $organization?.billingLimits ?? {
        bandwidth: 1,
        storage: 1,
        users: 1,
        executions: 1
    };

    const limitedServices = [
        { name: 'bandwidth', value: bandwidth },
        { name: 'storage', value: storage },
        { name: 'users', value: users },
        { name: 'executions', value: executions }
    ];

    const limit = getServiceLimit(serviceId) || Infinity;

    //TODO: refactor this to be a string
    const upgradeMethod = () => {
        showDropdown = false;
        goto(getChangePlanUrl($organization?.$id));
    };

    const dispatch = createEventDispatcher();

    $: planName = $organization?.billingPlanDetails.name;
    // these can be organization level limitations as well.
    // we need to migrate this sometime later, but soon!
    $: hasProjectLimitation = checkForProjectLimitation($organization?.billingPlanId, serviceId);

    $: hasUsageFees = hasProjectLimitation
        ? checkForUsageFees($organization?.billingPlanId, serviceId)
        : false;

    $: isLimited = limit !== 0 && limit < Infinity;
    $: overflowingServices = limitedServices.filter((service) => service.value > 0);
    $: isButtonDisabled =
        buttonDisabled ||
        ($readOnly && !GRACE_PERIOD_OVERRIDE) ||
        (isLimited && total >= limit && !hasUsageFees);

    onMount(() => {
        dispatch('data', { isButtonDisabled, limit, tier: planName });
    });

    // on free plan, if the only db is deleted,
    // `create database` button needs to be enabled again.
    $: if (isLimited) dispatch('data', { isButtonDisabled, limit, tier: planName });
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
        {@const supportsUsage = Object.keys($currentPlan.usage).length > 0}
        <slot
            name="alert"
            {limit}
            tier={planName}
            {title}
            {upgradeMethod}
            {hasUsageFees}
            {services}>
            {#if !supportsUsage && hasUsageFees}
                <Alert.Inline status="info">
                    <span class="text">
                        You've reached the {services} limit for the {planName} plan.
                        <Link on:mousedown={() => ($showUsageRatesModal = true)}
                            >Excess usage fees will apply</Link
                        >.
                    </span>
                </Alert.Inline>
            {:else}
                <Alert.Inline status={alertType}>
                    <span class="text">
                        You've reached the {services} limit for the {planName} plan. <Link
                            href={getChangePlanUrl($organization?.$id)}
                            event="organization_upgrade"
                            eventData={{ from: 'event', source: 'inline_alert' }}>Upgrade</Link> your
                        organization for additional resources.
                    </span>
                </Alert.Inline>
            {/if}
        </slot>
    {/if}
{/if}

<Layout.Stack direction="row" alignContent="center">
    <Layout.Stack direction="row">
        <Typography.Title size="m">{title}</Typography.Title>
        {#if isCloud && isLimited}
            <DropList bind:show={showDropdown} width="16">
                {#if hasProjectLimitation}
                    <Badge
                        variant="secondary"
                        content={`${total}/${limit} created`}
                        on:click={() => (showDropdown = !showDropdown)}>
                        <Icon icon={IconInfo} size="s" slot="start" />
                    </Badge>
                {:else}
                    <Badge
                        variant="secondary"
                        content="Limits applied"
                        on:click={() => (showDropdown = !showDropdown)}>
                        <Icon icon={IconInfo} size="s" slot="start" />
                    </Badge>
                {/if}
                <svelte:fragment slot="list">
                    <slot
                        name="tooltip"
                        {limit}
                        tier={planName}
                        {title}
                        {upgradeMethod}
                        {hasUsageFees}>
                        {#if hasProjectLimitation}
                            <p class="text">
                                You are limited to {limit}
                                {title.toLocaleLowerCase()} per project on the {planName} plan.
                                {#if canUpgrade($organization.billingPlanId)}<Link
                                        href={getChangePlanUrl($organization?.$id)}
                                        event="organization_upgrade"
                                        eventData={{ from: 'button', source: 'resource_limit_tag' }}
                                        >Upgrade</Link>
                                    for additional {title.toLocaleLowerCase()}.
                                {/if}
                            </p>
                        {:else if hasUsageFees}
                            <p class="text">
                                You are limited to {limit}
                                {title.toLocaleLowerCase()} per organization on the {planName} plan.
                                <Link on:mousedown={() => ($showUsageRatesModal = true)}
                                    >Excess usage fees will apply</Link
                                >.
                            </p>
                        {:else}
                            <p class="text">
                                You are limited to {limit}
                                {title.toLocaleLowerCase()} per organization on the {planName} plan.
                                {#if canUpgrade($organization.billingPlanId)}
                                    <Link href={getChangePlanUrl($organization?.$id)}>Upgrade</Link>
                                    for additional {title.toLocaleLowerCase()}.
                                {/if}
                            </p>
                        {/if}
                    </slot>
                </svelte:fragment>
            </DropList>
        {/if}
    </Layout.Stack>

    <slot {isButtonDisabled}>
        {#if buttonText}
            <ContainerButton
                {title}
                disabled={isButtonDisabled}
                {buttonText}
                {buttonEvent}
                {buttonEventData}
                {buttonMethod}
                {buttonHref} />
        {/if}
    </slot>
</Layout.Stack>
