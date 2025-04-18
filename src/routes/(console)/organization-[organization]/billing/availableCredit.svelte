<script lang="ts">
    import { CardGrid, Empty, PaginationInline } from '$lib/components';
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
    import { Alert, Badge, Icon, Link, Table, Tooltip, Typography } from '@appwrite.io/pink-svelte';
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
            <Alert.Inline status="info" title="Upgrade to Pro to add credits">
                Upgrade to a Pro plan to add credits to your organization. For more information on
                what you can do with a Pro plan,
                <Link.Anchor
                    href="https://appwrite.io/pricing"
                    target="_blank"
                    rel="noopener noreferrer">view our pricing guide.</Link.Anchor>
            </Alert.Inline>
        {:else}
            <div class="u-flex u-cross-center u-main-space-between">
                <div class="u-flex u-gap-8 u-cross-center">
                    <Typography.Text variant="m-600">Balance</Typography.Text>
                    <Badge
                        variant="secondary"
                        size="s"
                        content={formatCurrency(creditList.available)} />
                </div>
                {#if creditList?.total}
                    <Button secondary on:click={handleCredits}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Add credits
                    </Button>
                {/if}
            </div>
            {#if creditList?.total}
                <Table.Root columns={4} let:root>
                    <svelte:fragment slot="header" let:root>
                        <Table.Header.Cell {root}>Code</Table.Header.Cell>
                        <Table.Header.Cell {root}>Total</Table.Header.Cell>
                        <Table.Header.Cell {root}>Remaining</Table.Header.Cell>
                        <Table.Header.Cell {root}>Expires at</Table.Header.Cell>
                    </svelte:fragment>
                    {#each creditList.credits as credit}
                        <Table.Row.Base {root}>
                            <Table.Cell {root}>
                                {credit?.couponId ?? '-'}
                            </Table.Cell>
                            <Table.Cell {root}>
                                {formatCurrency(credit.total)}
                            </Table.Cell>
                            <Table.Cell {root}>
                                {#if credit.status === 'expired'}
                                    <span
                                        style="text-decoration: line-through;"
                                        class:u-hide={credit.credits === 0}>
                                        {formatCurrency(credit.credits)}</span> $0.00
                                {:else}
                                    {formatCurrency(credit.credits)}
                                {/if}
                            </Table.Cell>
                            <Table.Cell {root}>
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
                            </Table.Cell>
                        </Table.Row.Base>
                    {/each}
                </Table.Root>
                {#if creditList?.total > limit}
                    <div class="u-flex u-main-space-between">
                        <p class="text">Total credits: {creditList?.total}</p>
                        <PaginationInline {limit} bind:offset total={creditList?.total} hidePages />
                    </div>
                {/if}
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
