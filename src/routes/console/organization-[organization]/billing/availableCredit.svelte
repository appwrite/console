<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading, PaginationInline } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import type { Credit } from '$lib/sdk/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { Query } from '@appwrite.io/console';
    import { creditList } from './store';

    let coupon: string = null;
    let offset = 0;

    async function redeem() {
        try {
            await sdk.forConsole.billing.addCredit($organization.$id, coupon);
            addNotification({
                type: 'success',
                message: `A new payment method has been added to ${$organization.name}`
            });
            invalidate(Dependencies.ORGANIZATION);
            trackEvent(Submit.CouponRedeemed, {
                coupon
            });
            coupon = null;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.CouponRedeemed);
        }
    }

    async function request() {
        $creditList = await sdk.forConsole.billing.listCredits($organization.$id, [
            Query.limit(5),
            Query.offset(offset)
        ]);
    }

    $: if (offset !== null) {
        request();
    }

    $: balance = $creditList?.credits?.reduce((acc: number, curr: Credit) => acc + curr.credits, 0);
</script>

<CardGrid>
    <Heading tag="h2" size="6">Available credit</Heading>

    <p class="text">
        Apply Appwrite credit to your organizations. Once applied, credit will be automatically
        added to your next invoice.
    </p>
    <svelte:fragment slot="aside">
        <h4 class="body-text-1 u-bold">
            Credit balance: <span class="u-color-text-success">${balance}</span>
        </h4>
        <Form onSubmit={redeem} noMargin>
            <FormList>
                <InputText
                    placeholder="Entert promo code"
                    id="code"
                    label="Promo code"
                    bind:value={coupon}>
                    <Button secondary submit>Redeem</Button>
                </InputText>
            </FormList>
        </Form>
        {#if $creditList?.total}
            <Table noStyles noMargin>
                <TableHeader>
                    <TableCellHead>Date Added</TableCellHead>
                    <!-- <TableCellHead>Expiry Date</TableCellHead> -->
                    <TableCellHead>Amount</TableCellHead>
                </TableHeader>
                <TableBody>
                    {#each $creditList.credits as credit}
                        <TableRow>
                            <TableCellText title="date added">
                                {toLocaleDate(credit.$createdAt)}
                            </TableCellText>
                            <!-- <TableCellText title="expiry date">
                                {toLocaleDate(credit.expiration)}
                            </TableCellText> -->
                            <TableCellText title="amount">
                                ${credit.credits}
                            </TableCellText>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
            <div class="u-flex u-main-space-between">
                <p class="text">Total results: {$creditList?.total}</p>
                <PaginationInline limit={5} bind:offset sum={$creditList?.total} hidePages />
            </div>
        {/if}
    </svelte:fragment>
</CardGrid>
