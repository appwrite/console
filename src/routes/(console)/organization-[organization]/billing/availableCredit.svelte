<script lang="ts">
    import { Alert, CardGrid, Empty, PaginationInline } from '$lib/components';
    import {
        TableBody,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import type { CreditList } from '$lib/sdk/billing';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { Query } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import AddCreditWizard from './addCreditWizard.svelte';
    import { Button } from '$lib/elements/forms';
    import AddCreditModal from './addCreditModal.svelte';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { BillingPlan } from '$lib/constants';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { upgradeURL } from '$lib/stores/billing';
    import { Pill } from '$lib/elements';
    import { Icon, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    let offset = 0;
    let creditList: CreditList = {
        available: 0,
        credits: [],
        total: 0
    };
    let show = false;
    let reloadOnWizardClose = false;

    onMount(request);

    const limit = 5;

    function handleCredits() {
        if ($organization?.paymentMethodId || $organization?.backupPaymentMethodId) {
            show = true;
        } else {
            wizard.start(AddCreditWizard);
            reloadOnWizardClose = true;
        }
    }

    async function request() {
        if (!$organization?.$id) return;
        creditList = await sdk.forConsole.billing.listCredits($organization.$id, [
            Query.limit(limit),
            Query.offset(offset)
        ]);
        creditList = {
            ...creditList,
            credits: creditList.credits
                .map((credit) => {
                    const expiration = new Date(credit.expiration);
                    return {
                        ...credit,
                        status: expiration < new Date() ? 'expired' : credit.status
                    };
                })
                .sort((creditA, creditB) => {
                    // Sort non-expired credits before expired ones
                    if (creditA.status === 'expired' && creditB.status !== 'expired') return 1;
                    if (creditA.status !== 'expired' && creditB.status === 'expired') return -1;

                    // If both are non-expired or both are expired, sort by expiration date (soonest first)
                    return (
                        new Date(creditA.expiration).getTime() -
                        new Date(creditB.expiration).getTime()
                    );
                })
        };
    }

    $: if (offset !== null) {
        request();
    }

    $: {
        if (reloadOnWizardClose && !$wizard.show) {
            request();
            reloadOnWizardClose = false;
        }
    }
</script>

<CardGrid hideFooter={$organization?.billingPlan !== BillingPlan.FREE}>
    <svelte:fragment slot="title">
        {$organization?.billingPlan === BillingPlan.FREE ? 'Credits' : 'Available credit'}
    </svelte:fragment>
    Appwrite credit will automatically be applied to your next invoice.
    <svelte:fragment slot="aside">
        {#if $organization?.billingPlan === BillingPlan.FREE}
            <Alert type="info">
                <svelte:fragment slot="title">Upgrade to Pro to add credits</svelte:fragment>
                Upgrade to a Pro plan to add credits to your organization. For more information on what
                you can do with a Pro plan,
                <a
                    class="link"
                    href="https://appwrite.io/pricing"
                    target="_blank"
                    rel="noopener noreferrer">view our pricing guide.</a>
            </Alert>
        {:else}
            <div class="u-flex u-cross-center u-main-space-between">
                <div class="u-flex u-gap-8 u-cross-center">
                    <h4 class="body-text-1 u-bold">Balance</h4>
                    <span class="inline-tag">{formatCurrency(creditList.available)}</span>
                </div>
                {#if creditList?.total}
                    <Button secondary on:click={handleCredits}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Add credits
                    </Button>
                {/if}
            </div>
            {#if creditList?.total}
                <TableScroll noStyles noMargin class="u-margin-block-start-16">
                    <TableHeader>
                        <TableCellHead>Code</TableCellHead>
                        <TableCellHead>Total</TableCellHead>
                        <TableCellHead>Remaining</TableCellHead>
                        <TableCellHead>Expires at</TableCellHead>
                    </TableHeader>
                    <TableBody>
                        {#each creditList.credits as credit}
                            <TableRow>
                                <TableCellText title="code">
                                    {credit?.couponId ?? '-'}
                                </TableCellText>
                                <TableCellText title="total">
                                    {formatCurrency(credit.total)}
                                </TableCellText>
                                <TableCellText title="remaining">
                                    {#if credit.status === 'expired'}
                                        <span
                                            style="text-decoration: line-through;"
                                            class:u-hide={credit.credits === 0}>
                                            {formatCurrency(credit.credits)}</span> $0.00
                                    {:else}
                                        {formatCurrency(credit.credits)}
                                    {/if}
                                </TableCellText>
                                <TableCellText title="expiry date">
                                    {#if credit.status === 'expired'}
                                        <Tooltip>
                                            <span>
                                                <Pill>Expired</Pill>
                                            </span>
                                            <span slot="tooltip"
                                                >{toLocaleDate(credit.expiration)}</span>
                                        </Tooltip>
                                    {:else}
                                        {toLocaleDate(credit.expiration)}
                                    {/if}
                                </TableCellText>
                            </TableRow>
                        {/each}
                    </TableBody>
                </TableScroll>
                <div class="u-flex u-main-space-between">
                    <p class="text">Total credits: {creditList?.total}</p>
                    <PaginationInline {limit} bind:offset sum={creditList?.total} hidePages />
                </div>
            {:else}
                <Empty target="credits" on:click={handleCredits}>Add credits</Empty>
            {/if}
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="actions">
        {#if $organization?.billingPlan === BillingPlan.FREE}
            <Button
                secondary
                href={$upgradeURL}
                on:click={() => {
                    trackEvent(Click.OrganizationClickUpgrade, {
                        from: 'button',
                        source: 'billing_add_credits'
                    });
                }}>Upgrade to Pro</Button>
        {/if}
    </svelte:fragment>
</CardGrid>

<AddCreditModal bind:show on:success={request} />
