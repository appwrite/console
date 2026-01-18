<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Table, Typography } from '@appwrite.io/pink-svelte';
    import { BillingPlanGroup, type Models } from '@appwrite.io/console';
    import { abbreviateNumber, formatCurrency, isWithinSafeRange } from '$lib/helpers/numbers';

    export let show = false;
    export let org: Models.Organization;

    $: nextDate = org?.name
        ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toString()
        : org?.billingNextInvoiceDate;

    $: isFree = org.billingPlanDetails.group === BillingPlanGroup.Starter;

    // equal or above means unlimited!
    const getCorrectSeatsCountValue = (count: number): string | number => {
        // Check for Infinity or very large numbers
        const isUnlimited = count === Infinity || !isWithinSafeRange(count);
        return isUnlimited ? 'Unlimited' : count || 0;
    };

    function getPlanLimit(key: string): number | false {
        return org.billingPlanDetails[key] || false;
    }
</script>

<Modal bind:show title="Usage rates">
    {#if isFree}
        <Typography.Text>
            Usage on the {org.billingPlanDetails.name} plan is limited for the following resources. Next
            billing period: {toLocaleDate(nextDate)}.
        </Typography.Text>
    {:else if org.billingPlanDetails.group === BillingPlanGroup.Pro}
        <Typography.Text>
            Usage on the Pro plan will be charged at the end of each billing period at the following
            rates. Next billing period: {toLocaleDate(nextDate)}.
        </Typography.Text>
    {:else if org.billingPlanDetails.group === BillingPlanGroup.Scale}
        <Typography.Text>
            Usage on the Scale plan will be charged at the end of each billing period at the
            following rates. Next billing period: {toLocaleDate(nextDate)}.
        </Typography.Text>
    {/if}
    <Table.Root
        columns={[{ id: 'resource' }, { id: 'limit' }, { id: 'rate', hide: isFree }]}
        let:root>
        <svelte:fragment slot="header" let:root>
            <Table.Header.Cell column="resource" {root}>Resource</Table.Header.Cell>
            <Table.Header.Cell column="limit" {root}>Limit</Table.Header.Cell>
            <Table.Header.Cell column="rate" {root}>Rate</Table.Header.Cell>
        </svelte:fragment>
        {#each Object.values(org.billingPlanDetails.addons) as addon}
            <Table.Row.Base {root}>
                <Table.Cell column="resource" {root}>{addon.invoiceDesc}</Table.Cell>
                <Table.Cell column="limit" {root}>
                    {getCorrectSeatsCountValue(addon.limit)}
                </Table.Cell>
                {#if !isFree}
                    <Table.Cell column="rate" {root}>
                        {formatCurrency(addon.price)}/member
                    </Table.Cell>
                {/if}
            </Table.Row.Base>
        {/each}
        {#each Object.entries(org.billingPlanDetails.usage) as [key, usage]}
            {@const limit = getPlanLimit(key)}
            {@const show = limit !== false}
            {#if show}
                <Table.Row.Base {root}>
                    <Table.Cell column="resource" {root}>{usage.name}</Table.Cell>
                    <Table.Cell column="limit" {root}>
                        {abbreviateNumber(limit)}{usage.unit}
                    </Table.Cell>
                    {#if !isFree}
                        <Table.Cell column="rate" {root}>
                            {formatCurrency(usage.price)}/{abbreviateNumber(
                                usage.value
                            )}{usage.unit}
                        </Table.Cell>
                    {/if}
                </Table.Row.Base>
            {/if}
        {/each}
    </Table.Root>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
