<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import { organization, type Organization } from '$lib/stores/organization';
    import { plansInfo } from '$lib/stores/billing';
    import { abbreviateNumber, formatCurrency } from '$lib/helpers/numbers';
    import { BillingPlan } from '$lib/constants';

    export let show = false;
    export let org: Organization;

    $: plan = $plansInfo?.get(org.billingPlan);

    $: nextDate = org?.name
        ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toString()
        : $organization?.billingNextInvoiceDate;

    const planData = [
        {
            id: 'members',
            resource: 'Organization members',
            unit: 'member'
        },
        { id: 'bandwidth', resource: 'Bandwidth', unit: 'GB' },
        { id: 'storage', resource: 'Storage', unit: 'GB' },
        {
            id: 'executions',
            resource: 'Function executions',
            unit: ' executions'
        },
        {
            id: 'users',
            resource: 'Users',
            unit: ' Users'
        },
        {
            id: 'realtime',
            resource: 'Concurrent connections',
            unit: ' connections'
        }
    ];

    $: isFree = org.billingPlan === BillingPlan.FREE;

    // equal or above means unlimited!
    $: getCorrectSeatsCountValue = (count: number): string | number => {
        // php int max is always larger than js
        const exceedsSafeLimit = count >= Number.MAX_SAFE_INTEGER;
        return exceedsSafeLimit ? 'Unlimited' : count || 0;
    };
</script>

<Modal bind:show size="big" headerDivider={false} title="Usage rates">
    {#if isFree}
        Usage on the {$plansInfo?.get(BillingPlan.FREE).name} plan is limited for the following resources.
        Next billing period: {toLocaleDate(nextDate)}.
    {:else if org.billingPlan === BillingPlan.PRO}
        <p>
            Usage on the Pro plan will be charged at the end of each billing period at the following
            rates. Next billing period: {toLocaleDate(nextDate)}.
        </p>
    {:else if org.billingPlan === BillingPlan.SCALE}
        <p>
            Usage on the Scale plan will be charged at the end of each billing period at the
            following rates. Next billing period: {toLocaleDate(nextDate)}.
        </p>
    {/if}
    <Table noStyles noMargin>
        <TableHeader>
            <TableCellHead>Resource</TableCellHead>
            <TableCellHead>Limit</TableCellHead>
            {#if !isFree}
                <TableCellHead>Rate</TableCellHead>
            {/if}
        </TableHeader>
        <TableBody>
            {#each planData as usage}
                {#if usage['id'] === 'members'}
                    <TableRow>
                        <TableCellText title="resource">{usage.resource}</TableCellText>
                        <TableCellText title="limit">
                            {getCorrectSeatsCountValue(plan.addons.seats.limit)}
                        </TableCellText>
                        {#if !isFree}
                            <TableCellText title="rate">
                                {formatCurrency(plan.addons.seats.price)}/{usage?.unit}
                            </TableCellText>
                        {/if}
                    </TableRow>
                {:else}
                    {@const addon = plan.usage[usage.id]}
                    <TableRow>
                        <TableCellText title="resource">{usage.resource}</TableCellText>
                        <TableCellText title="limit">
                            {abbreviateNumber(plan[usage.id])}{usage?.unit}
                        </TableCellText>
                        {#if !isFree}
                            <TableCellText title="rate">
                                {formatCurrency(addon?.price)}/{['MB', 'GB', 'TB'].includes(
                                    addon?.unit
                                )
                                    ? addon?.value
                                    : abbreviateNumber(addon?.value, 0)}{usage?.unit}
                            </TableCellText>
                        {/if}
                    </TableRow>
                {/if}
            {/each}
        </TableBody>
    </Table>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
