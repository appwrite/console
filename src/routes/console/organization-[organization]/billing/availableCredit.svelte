<script lang="ts">
    import { CardGrid, Empty, Heading, PaginationInline } from '$lib/components';
    import {
        Table,
        TableBody,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import type { Credit, CreditList } from '$lib/sdk/billing';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { Query } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import AddCreditWizard from './addCreditWizard.svelte';
    import { Button } from '$lib/elements/forms';

    let offset = 0;
    let creditList: CreditList = {
        credits: [],
        total: 0
    };
    let show = false;

    onMount(async () => {
        request();
    });

    const limit = 5;

    function handleCredits() {
        if ($organization?.paymentMethodId || $organization?.backupPaymentMethodId) {
            show = true;
        } else {
            wizard.start(AddCreditWizard);
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

    $: balance = creditList?.credits?.reduce((acc: number, curr: Credit) => acc + curr.credits, 0);
</script>

<CardGrid>
    <Heading tag="h2" size="6">Available credit</Heading>

    <p class="text">Appwrite credit will automatically be applied to your next invoice.</p>
    <svelte:fragment slot="aside">
        <div class="u-flex u-cross-center u-main-space-between">
            <h4 class="body-text-1 u-bold">
                Credit balance <span class="inline-tag">${balance}</span>
            </h4>
            {#if creditList?.total}
                <Button secondary>
                    <span class="icon-plus" aria-hidden="true"></span>
                    <span class="text">Add credits</span>
                </Button>
            {/if}
        </div>
        {#if creditList?.total}
            <Table noStyles noMargin>
                <TableHeader>
                    <TableCellHead>Date Added</TableCellHead>
                    <TableCellHead>Expiry Date</TableCellHead>
                    <TableCellHead>Amount</TableCellHead>
                </TableHeader>
                <TableBody>
                    {#each creditList.credits as credit}
                        <TableRow>
                            <TableCellText title="date added">
                                {toLocaleDate(credit.$createdAt)}
                            </TableCellText>
                            <TableCellText title="expiry date">
                                {toLocaleDate(credit.expiration)}
                            </TableCellText>
                            <TableCellText title="amount">
                                ${credit.credits}
                            </TableCellText>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
            <div class="u-flex u-main-space-between">
                <p class="text">Total results: {creditList?.total}</p>
                <PaginationInline {limit} bind:offset sum={creditList?.total} hidePages />
            </div>
        {:else}
            <Empty target="credits" on:click={handleCredits}>Add credits</Empty>
        {/if}
    </svelte:fragment>
</CardGrid>
