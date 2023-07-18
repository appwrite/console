<script lang="ts">
    import { Modal } from '$lib/components';
    import { usageRates } from '$lib/constants';
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
    import { createOrganization } from './store';

    export let show = false;
    export let tier: string;

    $: nextDate = $createOrganization?.name
        ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toString()
        : $organization?.billingNextInvoiceDate;
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
            {#each usageRates[tier] as usage}
                <TableRow>
                    <TableCellText title="resource">{usage.resource}</TableCellText>
                    <TableCellText title="limit">{usage.limit}</TableCellText>
                    <TableCellText title="rate">{usage.rate}</TableCellText>
                </TableRow>
            {/each}
        </TableBody>
    </Table>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
