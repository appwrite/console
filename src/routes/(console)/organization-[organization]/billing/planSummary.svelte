<script lang="ts">
    import { base } from '$app/paths';
    import { CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { plansInfo, upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import type { Aggregation, CreditList, Invoice, Plan } from '$lib/sdk/billing';
    import { abbreviateNumber, formatCurrency, formatNumberWithCommas } from '$lib/helpers/numbers';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { BillingPlan } from '$lib/constants';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import {
        Accordion,
        Card,
        Divider,
        Icon,
        Layout,
        Tooltip,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { IconInfo, IconTag } from '@appwrite.io/pink-icons-svelte';
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

    function usageNameToLabel(name: string): string {
        switch (name) {
            case 'executions':
                return 'Executions';
            case 'storage':
                return 'Storage';
            case 'users':
                return 'Users';
            case 'bandwidth':
                return 'Bandwidth';
            default:
                return '';
        }
    }
</script>

{#if $organization}
    <CardGrid>
        <svelte:fragment slot="title">Payment estimates</svelte:fragment>
        A breakdown of your estimated upcoming payment for the current billing period. Totals displayed
        exclude accumulated credits and applicable taxes.
        <svelte:fragment slot="aside">
            <p class="text u-bold">
                Due at: {toLocaleDate($organization?.billingNextInvoiceDate)}
            </p>
            <Card.Base variant="secondary" padding="s">
                <Layout.Stack>
                    <Layout.Stack direction="row" justifyContent="space-between">
                        <Typography.Text color="--fgcolor-neutral-primary">
                            {currentPlan.name} plan
                        </Typography.Text>
                        <Typography.Text>
                            {isTrial || $organization?.billingPlan === BillingPlan.GITHUB_EDUCATION
                                ? formatCurrency(0)
                                : currentPlan
                                  ? formatCurrency(currentPlan?.price)
                                  : ''}
                        </Typography.Text>
                    </Layout.Stack>

                    {#if currentPlan.budgeting && extraUsage > 0}
                        <Accordion
                            hideDivider
                            title="Add-ons"
                            badge={(currentAggregation.additionalMembers > 0
                                ? currentInvoice.usage.length + 1
                                : currentInvoice.usage.length
                            ).toString()}>
                            <svelte:fragment slot="end">
                                {formatCurrency(extraUsage >= 0 ? extraUsage : 0)}
                            </svelte:fragment>
                            <Layout.Stack gap="xs">
                                {#if currentAggregation.additionalMembers}
                                    <Layout.Stack gap="xxxs">
                                        <Layout.Stack
                                            direction="row"
                                            justifyContent="space-between">
                                            <Typography.Text color="--fgcolor-neutral-primary"
                                                >Additional members</Typography.Text>
                                            <Typography.Text>
                                                {formatCurrency(
                                                    currentAggregation.additionalMemberAmount
                                                )}
                                            </Typography.Text>
                                        </Layout.Stack>
                                        <Layout.Stack direction="row">
                                            <Typography.Text
                                                >{currentAggregation.additionalMembers}</Typography.Text>
                                        </Layout.Stack>
                                    </Layout.Stack>
                                {/if}
                                {#if currentInvoice?.usage}
                                    {#each currentInvoice.usage as excess, i}
                                        {#if i > 0 || currentAggregation.additionalMembers}
                                            <Divider />
                                        {/if}
                                        {#if ['storage', 'bandwidth'].includes(excess.name)}
                                            {@const excessValue = humanFileSize(excess.value)}
                                            <Layout.Stack gap="xxxs">
                                                <Layout.Stack
                                                    direction="row"
                                                    justifyContent="space-between">
                                                    <Typography.Text
                                                        color="--fgcolor-neutral-primary"
                                                        >{usageNameToLabel(
                                                            excess.name
                                                        )}</Typography.Text>
                                                    <Typography.Text
                                                        >{formatCurrency(
                                                            excess.amount
                                                        )}</Typography.Text>
                                                </Layout.Stack>
                                                <Layout.Stack direction="row">
                                                    <Layout.Stack direction="row">
                                                        <Tooltip
                                                            placement="bottom"
                                                            disabled={excess.value <=
                                                                1_000_000_000}>
                                                            <svelte:fragment slot="tooltip">
                                                                {formatNumberWithCommas(
                                                                    excess.value ?? 0
                                                                )} bytes
                                                            </svelte:fragment>
                                                            <span
                                                                >{excessValue.value ??
                                                                    0}{excessValue.unit}</span>
                                                        </Tooltip>
                                                    </Layout.Stack>
                                                </Layout.Stack>
                                            </Layout.Stack>
                                        {/if}
                                        {#if ['users', 'executions'].includes(excess.name)}
                                            <Layout.Stack gap="xxxs">
                                                <Layout.Stack
                                                    direction="row"
                                                    justifyContent="space-between">
                                                    <Typography.Text
                                                        color="--fgcolor-neutral-primary"
                                                        >{usageNameToLabel(
                                                            excess.name
                                                        )}</Typography.Text>
                                                    <Typography.Text
                                                        >{formatCurrency(
                                                            excess.amount
                                                        )}</Typography.Text>
                                                </Layout.Stack>
                                                <Layout.Stack direction="row">
                                                    <Tooltip
                                                        placement="bottom"
                                                        disabled={excess.value <= 1000}>
                                                        <svelte:fragment slot="tooltip">
                                                            {formatNumberWithCommas(excess.value)}
                                                        </svelte:fragment>
                                                        <span
                                                            >{abbreviateNumber(excess.value)}</span>
                                                    </Tooltip>
                                                </Layout.Stack>
                                            </Layout.Stack>
                                        {/if}
                                    {/each}
                                {/if}
                            </Layout.Stack>
                        </Accordion>
                    {/if}

                    {#if currentPlan.supportsCredits && availableCredit > 0}
                        <Layout.Stack direction="row" justifyContent="space-between">
                            <Layout.Stack direction="row" alignItems="center" gap="xxs">
                                <Icon size="s" icon={IconTag} color="--fgcolor-success" />
                                <Typography.Text color="--fgcolor-neutral-primary"
                                    >Credits to be applied</Typography.Text>
                            </Layout.Stack>
                            <Typography.Text color="--fgcolor-success">
                                -{formatCurrency(
                                    Math.min(availableCredit, currentInvoice?.amount ?? 0)
                                )}
                            </Typography.Text>
                        </Layout.Stack>
                    {/if}

                    {#if $organization?.billingPlan !== BillingPlan.FREE && $organization?.billingPlan !== BillingPlan.GITHUB_EDUCATION}
                        <Divider />
                        <Layout.Stack direction="row" justifyContent="space-between">
                            <Typography.Text color="--fgcolor-neutral-primary" variant="m-500">
                                <Layout.Stack direction="row" alignItems="center" gap="s">
                                    Current total (USD)
                                    <Tooltip>
                                        <Icon icon={IconInfo} />
                                        <svelte:fragment slot="tooltip">
                                            Estimates are updated daily and may differ from your
                                            final invoice.
                                        </svelte:fragment>
                                    </Tooltip>
                                </Layout.Stack>
                            </Typography.Text>
                            <Typography.Text color="--fgcolor-neutral-primary" variant="m-500">
                                {formatCurrency(
                                    Math.max(
                                        (currentInvoice?.amount ?? 0) -
                                            Math.min(availableCredit, currentInvoice?.amount ?? 0),
                                        0
                                    )
                                )}
                            </Typography.Text>
                        </Layout.Stack>
                    {/if}
                </Layout.Stack>
            </Card.Base>
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
