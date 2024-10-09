<script lang="ts">
    import { Alert, CardGrid, Empty, Heading, PaginationInline } from '$lib/components';
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
    import { trackEvent } from '$lib/actions/analytics';
    import { upgradeURL } from '$lib/stores/billing';

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
    <Heading tag="h2" size="6">Available credit</Heading>

    <p class="text">Appwrite credit will automatically be applied to your next invoice.</p>
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
                        <span class="icon-plus" aria-hidden="true"></span>
                        <span class="text">Add credits</span>
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
                                    {formatCurrency(credit.credits)}
                                </TableCellText>
                                <TableCellText title="expiry date">
                                    {toLocaleDate(credit.expiration)}
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
                    trackEvent('click_organization_upgrade', {
                        from: 'button',
                        source: 'billing_add_credits'
                    });
                }}>Upgrade to Pro</Button>
        {/if}
    </svelte:fragment>
</CardGrid>

<AddCreditModal bind:show on:success={request} />
