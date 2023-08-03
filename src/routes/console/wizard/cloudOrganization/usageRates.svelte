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
    import { organization } from '$lib/stores/organization';
    import { onMount } from 'svelte';
    import { createOrganization } from './store';
    import { sdk } from '$lib/stores/sdk';
    import type { Plan } from '$lib/sdk/billing';

    export let show = false;
    export let tier: string;

    let plan: Plan = null;
    onMount(async () => {
        const planList = await sdk.forConsole.billing.getPlanList();
        plan = planList.plans.find((p) => p.$id === tier);
    });

    $: nextDate = $createOrganization?.name
        ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toString()
        : $organization?.billingNextInvoiceDate;

    $: console.log(plan);

    const planData = [
        {
            id: 'members',
            resource: 'Organization members',
            unit: ''
        },
        { id: 'bandwith', resource: 'Bandwidth', unit: 'GB' },
        { id: 'storage', resource: 'Storage', unit: 'GB' },
        {
            id: 'executions',
            resource: 'Function executions',
            unit: 'executions'
        },
        {
            id: 'users',
            resource: 'Active users',
            unit: 'AU'
        },
        {
            id: 'realtime',
            resource: 'Concurrent connections',
            unit: 'connections'
        }
    ];
</script>

<Modal bind:show size="big" headerDivider={false}>
    <svelte:fragment slot="header">Usage rates</svelte:fragment>
    <p>
        Usage on the Pro plan and Scale plan will be charged at the end of each billing period at
        the following rates. Next billing period: {toLocaleDate(nextDate)}
    </p>

    <Table noStyles>
        <TableHeader>
            <TableCellHead>Resource</TableCellHead>
            <TableCellHead>Limit</TableCellHead>
            <TableCellHead>Rate</TableCellHead>
        </TableHeader>
        <TableBody>
            {#each planData as usage}
                <TableRow>
                    <TableCellText title="resource">{usage.resource}</TableCellText>
                    <TableCellText title="limit">{plan[usage.id]}{usage?.unit}</TableCellText>
                    <TableCellText title="rate">{plan[`${usage.id}Addon`]}</TableCellText>
                </TableRow>
            {/each}
        </TableBody>
    </Table>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
