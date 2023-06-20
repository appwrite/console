<script>
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
    import { createOrganization } from './store';
    export let show = false;
</script>

<Modal bind:show size="big" headerDivider={false}>
    <svelte:fragment slot="header">Usage rates</svelte:fragment>
    <!-- TODO: add billing period -->
    <p>
        Usage on the Pro plan will be charged at the end of each billing period at the following
        rates. Next billing period: 05 Jun, 2023.
    </p>

    <Table noStyles>
        <TableHeader>
            <TableCellHead>Resource</TableCellHead>
            <TableCellHead>Limit</TableCellHead>
            <TableCellHead>Rate</TableCellHead>
        </TableHeader>
        <TableBody>
            {#each usageRates[$createOrganization.tier] as usage}
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
