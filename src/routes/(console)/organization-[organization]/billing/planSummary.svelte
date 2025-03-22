<script lang="ts">
    import { base } from '$app/paths';
    import { Card, CardGrid, Collapsible, CollapsibleItem, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { plansInfo, upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import type { Aggregation, CreditList, Invoice, Plan } from '$lib/sdk/billing';
    import { abbreviateNumber, formatCurrency, formatNumberWithCommas } from '$lib/helpers/numbers';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { BillingPlan } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';
    import { tooltip } from '$lib/actions/tooltip';
    import CancelDowngradeModel from './cancelDowngradeModal.svelte';

    export let currentPlan: Plan;
    export let creditList: CreditList;
    export let currentInvoice: Invoice | undefined = undefined;
    export let currentAggregation: Aggregation | undefined = undefined;

    let showCancel: boolean = false;

    const availableCredit = creditList.available;
    const today = new Date();
    const isTrial =
        new Date($organization?.billingStartDate).getTime() - today.getTime() > 0 &&
        $plansInfo.get($organization.billingPlan)?.trialDays;
    const extraUsage = currentInvoice ? currentInvoice.amount - currentPlan?.price : 0;
</script>

{#if $organization}
    <CardGrid>
        <Heading tag="h2" size="6">Payment estimates</Heading>

        <p class="text">
            A breakdown of your estimated upcoming payment for the current billing period. Totals
            displayed exclude accumulated credits and applicable taxes.
        </p>
        <svelte:fragment slot="aside">
            <p class="text u-bold">
                Due at: {toLocaleDate($organization?.billingNextInvoiceDate)}
            </p>
            <Card isTile style="--p-card-padding: 1.5rem;" class="card-only-on-desktop">
                <Collapsible>
                    <div class="u-flex-vertical u-gap-8">
                        <div class="u-flex">
                            <span class="body-text-2">{currentPlan.name} plan</span>
                            <div class="body-text-2 u-margin-inline-start-auto">
                                {isTrial ||
                                $organization?.billingPlan === BillingPlan.GITHUB_EDUCATION
                                    ? formatCurrency(0)
                                    : currentPlan
                                      ? formatCurrency(currentPlan?.price)
                                      : ''}
                            </div>
                        </div>

                        {#if currentPlan.budgeting && extraUsage > 0}
                            <CollapsibleItem gap={8}>
                                <svelte:fragment slot="beforetitle">
                                    <span class="body-text-2"><b>Add-ons</b></span><span
                                        class="inline-tag"
                                        >{currentAggregation.additionalMembers > 0
                                            ? currentInvoice.usage.length + 1
                                            : currentInvoice.usage.length}</span>
                                    <div class="icon">
                                        <span class="icon-cheveron-down" aria-hidden="true"></span>
                                    </div>
                                </svelte:fragment>
                                <svelte:fragment slot="end">
                                    <div class="body-text-2 u-margin-inline-start-auto">
                                        <b>
                                            {formatCurrency(extraUsage >= 0 ? extraUsage : 0)}
                                        </b>
                                    </div>
                                </svelte:fragment>

                                <ul>
                                    {#if currentAggregation.additionalMembers}
                                        <li class="u-flex-vertical u-gap-4 u-padding-block-8">
                                            <div class="u-flex u-gap-4">
                                                <h5 class="body-text-2 u-stretch">
                                                    Additional members
                                                </h5>
                                                <div>
                                                    {formatCurrency(
                                                        currentAggregation.additionalMemberAmount
                                                    )}
                                                </div>
                                            </div>
                                            <div class="u-flex u-gap-4">
                                                <h5
                                                    class="body-text-2 u-stretch u-color-text-offline">
                                                    {currentAggregation.additionalMembers}
                                                </h5>
                                            </div>
                                        </li>
                                    {/if}
                                    {#if currentInvoice?.usage}
                                        {#each currentInvoice.usage as excess, i}
                                            <li
                                                class="u-flex-vertical u-gap-4 {currentAggregation.additionalMembers >
                                                0
                                                    ? 'u-padding-block-8'
                                                    : 'u-padding-block-start-8'}"
                                                class:u-sep-block-start={i > 0 ||
                                                    currentAggregation.additionalMembers > 0}>
                                                {#if ['storage', 'bandwidth'].includes(excess.name)}
                                                    {@const excessValue = humanFileSize(
                                                        excess.value
                                                    )}
                                                    <div class="u-flex u-main-space-between">
                                                        <h5
                                                            class="body-text-2 u-stretch u-capitalize">
                                                            {excess.name}
                                                        </h5>
                                                        {formatCurrency(excess.amount)}
                                                    </div>
                                                    <h5
                                                        class="body-text-2 u-stretch u-color-text-offline"
                                                        title={formatNumberWithCommas(
                                                            excess.value ?? 0
                                                        ) + 'bytes'}>
                                                        {excessValue.value ?? 0}{excessValue.unit}
                                                    </h5>
                                                {:else if excess.name !== 'member'}
                                                    <div class="u-flex u-main-space-between">
                                                        <h5
                                                            class="body-text-2 u-stretch u-capitalize">
                                                            {excess.name}
                                                        </h5>
                                                        {formatCurrency(excess.amount)}
                                                    </div>
                                                    <h5
                                                        class="body-text-2 u-stretch u-color-text-offline"
                                                        title={formatNumberWithCommas(
                                                            excess.value
                                                        )}>
                                                        {abbreviateNumber(excess.value)}
                                                    </h5>
                                                {/if}
                                            </li>
                                        {/each}
                                    {/if}
                                </ul>
                            </CollapsibleItem>
                        {/if}

                        {#if currentPlan.supportsCredits && availableCredit > 0}
                            <CollapsibleItem noContent gap={4}>
                                <span class="body-text-2 u-flex u-cross-center u-gap-2"
                                    ><svg
                                        width="16"
                                        height="17"
                                        viewBox="0 0 16 17"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M14.166 7.93434C14.4784 8.24676 14.4784 8.75329 14.166 9.06571L8.56603 14.6657C8.25361 14.9781 7.74708 14.9781 7.43466 14.6657L1.83466 9.06571C1.67842 8.90947 1.60032 8.70469 1.60034 8.49992V4.50002C1.60034 3.17454 2.67486 2.10002 4.00034 2.10002H8.00056C8.20523 2.10008 8.40987 2.17818 8.56603 2.33434L14.166 7.93434ZM4.00034 5.30002C4.44217 5.30002 4.80034 4.94185 4.80034 4.50002C4.80034 4.05819 4.44217 3.70002 4.00034 3.70002C3.55851 3.70002 3.20034 4.05819 3.20034 4.50002C3.20034 4.94185 3.55851 5.30002 4.00034 5.30002Z"
                                            fill="#00BC5D" />
                                    </svg>
                                    Credits to be applied</span>

                                <div
                                    class="body-text-2 u-margin-inline-start-auto"
                                    style="color: var(--web-green-500, #10B981)">
                                    -{formatCurrency(
                                        Math.min(availableCredit, currentInvoice?.amount ?? 0)
                                    )}
                                </div>
                            </CollapsibleItem>
                        {/if}

                        {#if $organization?.billingPlan !== BillingPlan.FREE && $organization?.billingPlan !== BillingPlan.GITHUB_EDUCATION}
                            <CollapsibleItem
                                noContent
                                gap={4}
                                style="margin-block-start: 1rem; padding-block: unset;"
                                wrapperStyle="padding-block: unset; padding-inline: unset;">
                                <span class="body-text-2">Current total (USD)</span>
                                <span class="tooltip u-cross-center" aria-label="total info">
                                    <span
                                        class="icon-info"
                                        aria-hidden="true"
                                        use:tooltip={{
                                            content:
                                                'Totals displayed are estimates updated every 24 hours and may not accurately reflect your invoice.'
                                        }}></span>
                                </span>
                                <div class="body-text-2 u-margin-inline-start-auto">
                                    {formatCurrency(
                                        Math.max(
                                            (currentInvoice?.amount ?? 0) -
                                                Math.min(
                                                    availableCredit,
                                                    currentInvoice?.amount ?? 0
                                                ),
                                            0
                                        )
                                    )}
                                </div>
                            </CollapsibleItem>
                        {/if}
                    </div>
                </Collapsible>
            </Card>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            {#if $organization?.billingPlan === BillingPlan.FREE || $organization?.billingPlan === BillingPlan.GITHUB_EDUCATION}
                <div
                    class="u-flex u-flex-vertical-mobile u-cross-center u-gap-16 u-flex-wrap u-width-full-line u-main-end">
                    <Button text href={`${base}/organization-${$organization?.$id}/usage`}>
                        View estimated usage
                    </Button>
                    <Button
                        disabled={$organization?.markedForDeletion}
                        href={$upgradeURL}
                        on:click={() =>
                            trackEvent('click_organization_upgrade', {
                                from: 'button',
                                source: 'billing_tab'
                            })}>
                        Upgrade
                    </Button>
                </div>
            {:else}
                <div
                    class="u-flex u-flex-vertical-mobile u-cross-center u-gap-16 u-flex-wrap u-width-full-line u-main-end">
                    {#if $organization?.billingPlanDowngrade !== null}
                        <Button text on:click={() => (showCancel = true)}>Cancel change</Button>
                    {:else}
                        <Button
                            text
                            disabled={$organization?.markedForDeletion}
                            href={$upgradeURL}
                            on:click={() =>
                                trackEvent('click_organization_plan_update', {
                                    from: 'button',
                                    source: 'billing_tab'
                                })}>
                            Change plan
                        </Button>
                    {/if}
                    <Button secondary href={`${base}/organization-${$organization?.$id}/usage`}>
                        View estimated usage
                    </Button>
                </div>
            {/if}
        </svelte:fragment>
    </CardGrid>
{/if}
<CancelDowngradeModel bind:showCancel />

<style>
    :root {
        --billing-card-border-color: hsl(var(--color-neutral-10));
    }

    :global(.card-only-on-desktop) {
        background: hsl(var(--color-neutral-5));
        border-radius: var(--corner-radius-medium, 8px);
        border: 1px solid var(--billing-card-border-color);
    }

    :global(.theme-dark .card-only-on-desktop) {
        background: #2c2c2f;
        --billing-card-border-color: #424248;
    }

    :global(.card-only-on-desktop .collapsible-item:only-of-type) {
        margin-block-start: 0.5rem;
        border-block-start: solid 0.0625rem hsl(var(--p-toggle-border-color));
    }

    @media (max-width: 768px) {
        :global(.card-only-on-desktop) {
            padding: 0.5rem;
            box-shadow: unset;
            border-radius: unset;

            /* yes, these `!important`s are needed */
            border: unset !important;
            background: unset !important;
        }
    }
</style>
