<script lang="ts">
    import { base } from '$app/paths';
    import { EstimatedCard } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { plansInfo, upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import type { AggregationTeam, Invoice, Plan } from '$lib/sdk/billing';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { BillingPlan } from '$lib/constants';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Card, Divider, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { IconTag } from '@appwrite.io/pink-icons-svelte';
    import CancelDowngradeModel from './cancelDowngradeModal.svelte';
    import ProjectUsageAccordion from './projectUsageAccordion.svelte';

    export let currentPlan: Plan;
    export let currentInvoice: Invoice | undefined = undefined;
    export let currentAggregation: AggregationTeam | undefined = undefined;
    export let availableCredit: number | undefined = undefined;
    export let organizationUsage: any = undefined;
    export let usageProjects: Record<string, any> = {};

    let showCancel: boolean = false;

    const today = new Date();
    const isTrial =
        new Date($organization?.billingStartDate).getTime() - today.getTime() > 0 &&
        $plansInfo.get($organization.billingPlan)?.trialDays;
    const extraUsage = currentInvoice ? currentInvoice.amount - currentPlan?.price : 0;
</script>

{#if $organization}
    <EstimatedCard>
        <Typography.Title size="s">{currentPlan.name} plan</Typography.Title>

        <Typography.Text color="--fgcolor-neutral-primary">
            Next payment of <span class="text u-bold"
                >{formatCurrency(currentInvoice?.amount || currentPlan?.price || 0)}</span>
            will occur on
            <span class="text u-bold">{toLocaleDate($organization?.billingNextInvoiceDate)}</span>.
        </Typography.Text>

        <Divider />

        <div class="billing-cycle-header">
            <Typography.Text color="--fgcolor-neutral-primary" variant="m-500">
                Current billing cycle ({new Date(
                    $organization?.billingCurrentInvoiceDate
                ).toLocaleDateString('en', { day: 'numeric', month: 'short' })}-{new Date(
                    $organization?.billingNextInvoiceDate
                ).toLocaleDateString('en', { day: 'numeric', month: 'short' })})
            </Typography.Text>
            <Typography.Text color="--fgcolor-neutral-tertiary" variant="m-400">
                Estimate, subject to change based on usage.
            </Typography.Text>
        </div>

        <!-- Billing breakdown table -->
        <Card.Base variant="secondary" padding="s">
            <Layout.Stack>
                <!-- Base Plan -->
                <div class="billing-row">
                    <Typography.Text color="--fgcolor-neutral-primary">Base plan</Typography.Text>
                    <Typography.Text class="price">
                        {formatCurrency(
                            isTrial || $organization?.billingPlan === BillingPlan.GITHUB_EDUCATION
                                ? 0
                                : currentPlan?.price || 0
                        )}
                    </Typography.Text>
                </div>

                <!-- Project Usage Accordion -->
                {#if organizationUsage?.projects && organizationUsage.projects.length > 0}
                    <ProjectUsageAccordion
                        projects={organizationUsage.projects}
                        {usageProjects}
                        {currentPlan}
                        {currentAggregation} />
                {/if}

                <!-- Add-ons -->
                {#if currentPlan.budgeting && extraUsage > 0}
                    {#each currentAggregation.resources.filter((r) => r.amount && r.amount > 0) as excess}
                        <div class="billing-row">
                            <Typography.Text color="--fgcolor-neutral-primary"
                                >{excess.resourceId}</Typography.Text>
                            <Typography.Text class="price"
                                >{formatCurrency(excess.amount)}</Typography.Text>
                        </div>
                    {/each}
                {/if}

                {#if currentPlan.supportsCredits && availableCredit > 0}
                    <div class="billing-row">
                        <div class="credits-content">
                            <Icon size="s" icon={IconTag} color="--fgcolor-success" />
                            <Typography.Text color="--fgcolor-neutral-primary"
                                >Credits to be applied</Typography.Text>
                        </div>
                        <Typography.Text class="price" color="--fgcolor-success">
                            -{formatCurrency(
                                Math.min(availableCredit, currentInvoice?.amount ?? 0)
                            )}
                        </Typography.Text>
                    </div>
                {/if}

                <Divider />

                <!-- Total -->
                <div class="billing-row total">
                    <Typography.Text color="--fgcolor-neutral-primary" variant="m-500"
                        >Total</Typography.Text>
                    <Typography.Text
                        class="price"
                        color="--fgcolor-neutral-primary"
                        variant="m-500">
                        {formatCurrency(
                            Math.max(
                                (currentInvoice?.amount ?? 0) -
                                    Math.min(availableCredit, currentInvoice?.amount ?? 0),
                                0
                            )
                        )}
                    </Typography.Text>
                </div>
            </Layout.Stack>
        </Card.Base>

        <!-- Actions -->
        <div class="actions-container">
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
                            trackEvent(Click.OrganizationClickUpgrade, {
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
        </div>
    </EstimatedCard>
{/if}

<CancelDowngradeModel bind:showCancel />

<style>
    :root {
        --billing-card-border-color: hsl(var(--color-neutral-10));
    }

    .billing-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--bgcolor-neutral-invert);
    }

    .billing-row:last-child {
        border-bottom: none;
    }

    .billing-row.total {
        border-top: 1px solid var(--bgcolor-neutral-invert);
        border-bottom: none;
        padding-top: 1rem;
        margin-top: 0.5rem;
    }

    .price {
        text-align: right;
        min-width: 80px;
    }

    .credits-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .billing-cycle-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
        margin-top: 1.5rem;
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
        .billing-cycle-header {
            flex-direction: column;
            gap: 8px;
        }

        :global(.card-only-on-desktop) {
            padding: 0.5rem;
            box-shadow: unset;
            border-radius: unset;
            border: unset !important;
            background: unset !important;
        }
    }
</style>
