<script lang="ts">
    import { DropList, DropListItem, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { Container } from '$lib/layout';

    export let invoices = [];
    let showDropdown = [];
</script>

<Container>
    <div class="common-section">
        <Heading tag="h2" size="5">Invoices</Heading>
    </div>
    <TableScroll>
        <TableHeader>
            <TableCellHead width={100}>Date</TableCellHead>
            <TableCellHead width={100}>Status</TableCellHead>
            <TableCellHead width={80}>Amount Due</TableCellHead>
            <TableCellHead width={90}>Invoce #</TableCellHead>
            <TableCellHead width={40} />
        </TableHeader>
        <TableBody>
            {#each invoices as invoice, i}
                <TableRow>
                    <TableCellText title="date">test</TableCellText>
                    <TableCell title="status">
                        <Pill>test</Pill>
                    </TableCell>
                    <TableCellText title="due">$1BILLION</TableCellText>
                    <TableCellText title="invoice number">test</TableCellText>
                    <TableCell showOverflow>
                        <DropList bind:show={showDropdown[i]} placement="bottom-start" noArrow>
                            <button
                                class="button is-only-icon is-text"
                                aria-label="More options"
                                on:click|preventDefault={() => {
                                    showDropdown[i] = !showDropdown[i];
                                }}>
                                <span class="icon-dots-horizontal" aria-hidden="true" />
                            </button>
                            <svelte:fragment slot="list">
                                <DropListItem
                                    icon="external-link"
                                    on:click={() => {
                                        console.log('test');
                                    }}>View invoice</DropListItem>

                                <DropListItem
                                    icon="download"
                                    on:click={() => {
                                        console.log('test');
                                    }}>Download PDF</DropListItem>
                            </svelte:fragment>
                        </DropList>
                    </TableCell>
                </TableRow>
            {/each}
        </TableBody>
    </TableScroll>
</Container>
