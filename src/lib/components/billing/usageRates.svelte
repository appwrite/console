<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { type Organization } from '$lib/stores/organization';
    import { plansInfo } from '$lib/stores/billing';
    import { abbreviateNumber, formatCurrency } from '$lib/helpers/numbers';
    import { BillingPlan } from '$lib/constants';
    import { Table, Typography } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let org: Organization;

    $: plan = $plansInfo?.get(org.billingPlan);

    $: nextDate = org?.name
        ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toString()
        : org?.billingNextInvoiceDate;

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
</script>

<Modal bind:show title="Usage rates">
    {#if isFree}
        <Typography.Text>
            Usage on the {$plansInfo?.get(BillingPlan.FREE).name} plan is limited for the following resources.
            Next billing period: {toLocaleDate(nextDate)}.
        </Typography.Text>
    {:else if org.billingPlan === BillingPlan.PRO}
        <Typography.Text>
            Usage on the Pro plan will be charged at the end of each billing period at the following
            rates. Next billing period: {toLocaleDate(nextDate)}.
        </Typography.Text>
    {:else if org.billingPlan === BillingPlan.SCALE}
        <Typography.Text>
            Usage on the Scale plan will be charged at the end of each billing period at the
            following rates. Next billing period: {toLocaleDate(nextDate)}.
        </Typography.Text>
    {/if}
    <Table.Root>
        <svelte:fragment slot="header">
            <Table.Header.Cell>Resource</Table.Header.Cell>
            <Table.Header.Cell>Limit</Table.Header.Cell>
            {#if !isFree}
                <Table.Header.Cell>Rate</Table.Header.Cell>
            {/if}
        </svelte:fragment>
        {#each planData as usage}
            {#if usage['id'] === 'members'}
                <Table.Row>
                    <Table.Cell>{usage.resource}</Table.Cell>
                    <Table.Cell>
                        {plan[usage.id] || 'Unlimited'}
                    </Table.Cell>
                    {#if !isFree}
                        <Table.Cell>
                            {formatCurrency(plan.addons?.member?.price)}/{usage?.unit}
                        </Table.Cell>
                    {/if}
                </Table.Row>
            {:else}
                {@const addon = plan.addons[usage.id]}
                <Table.Row>
                    <Table.Cell>{usage.resource}</Table.Cell>
                    <Table.Cell>
                        {abbreviateNumber(plan[usage.id])}{usage?.unit}
                    </Table.Cell>
                    {#if !isFree}
                        <Table.Cell>
                            {formatCurrency(addon?.price)}/{['MB', 'GB', 'TB'].includes(addon?.unit)
                                ? addon?.value
                                : abbreviateNumber(addon?.value, 0)}{usage?.unit}
                        </Table.Cell>
                    {/if}
                </Table.Row>
            {/if}
        {/each}
    </Table.Root>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
