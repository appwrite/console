<script lang="ts">
    import {
        DropList,
        DropListItem,
        DropListLink,
        EmptySearch,
        Heading,
        PaginationInline
    } from '$lib/components';
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

    export let data;
    export let offset = 0;

    let showDropdown = [];
</script>

<Container>
    <div class="common-section">
        <Heading tag="h2" size="5">Invoices</Heading>
    </div>
    {#if data.invoices?.total}
        <TableScroll>
            <TableHeader>
                <TableCellHead width={100}>Date</TableCellHead>
                <TableCellHead width={100}>Status</TableCellHead>
                <TableCellHead width={80}>Amount Due</TableCellHead>
                <TableCellHead width={90}>Invoce #</TableCellHead>
                <TableCellHead width={40} />
            </TableHeader>
            <TableBody>
                <!-- {#each data.invoices?.invoices as invoice, i} -->
                {#each [] as invoice, i}
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
                                    <DropListLink icon="external-link" href="#/">
                                        View invoice
                                    </DropListLink>
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
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {data.invoices?.total}</p>
            <PaginationInline limit={5} bind:offset sum={data.invoices?.total} />
        </div>
    {:else}
        <EmptySearch>
            You have no payment history. After you receive your first invoice, you'll see it here.
        </EmptySearch>
    {/if}
</Container>
