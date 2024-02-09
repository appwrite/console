<script lang="ts">
    import { MessageType, MessagingProviderType, type Models } from '@appwrite.io/console';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { CardGrid, Heading, PaginationInline, Id, EmptySearch } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';

    export let status: string;
    export let targets: Models.Target[];
    export let usersById: Record<string, Models.User<Models.Preferences>>;
    export let onEdit: () => void;

    function openToTargets() {
        onEdit();
        wizard.setStep(2);
    }

    let offset = 0;
    const limit = 10;
</script>

<CardGrid>
    <Heading tag="h6" size="7" id="variables">Targets</Heading>
    <svelte:fragment slot="aside">
        {@const sum = targets.length}
        {#if sum}
            <div class="u-flex u-flex-vertical u-gap-24">
                <Table noMargin noStyles>
                    <TableHeader>
                        <TableCellHead>ID</TableCellHead>
                        <TableCellHead>Name</TableCellHead>
                        <TableCellHead>Identifier</TableCellHead>
                    </TableHeader>
                    <TableBody>
                        {#each targets.slice(offset, offset + limit) as target (target.$id)}
                            <TableRow>
                                <TableCell title="id">
                                    <Id value={target.$id}>{target.$id}</Id>
                                </TableCell>

                                <TableCellText title="name">
                                    {usersById[target.userId]?.name || 'Unknown'}
                                </TableCellText>

                                <TableCellText title="subscribers">
                                    {target.providerType === MessagingProviderType.Push
                                        ? target.name
                                        : target.identifier}
                                </TableCellText>
                            </TableRow>
                        {/each}
                    </TableBody>
                </Table>
                <div class="u-flex u-main-space-between">
                    <p class="text">Total targets: {sum}</p>
                    <PaginationInline {sum} {limit} bind:offset />
                </div>
            </div>
        {:else}
            <EmptySearch hidePagination>
                <div class="u-text-center">
                    No targets have been selected.
                    {#if status === MessageType.Draft}
                        <p>Edit the message and select targets to see them here.</p>
                    {:else}
                        <p>
                            Need a hand? Check out our <Button
                                link
                                external
                                href="http://appwrite.io/docs/products/messaging/targets"
                                text>
                                documentation</Button
                            >.
                        </p>
                    {/if}
                </div>
                {#if status === MessageType.Draft}
                    <div class="u-flex u-gap-16">
                        <Button
                            external
                            href="http://appwrite.io/docs/products/messaging/targets"
                            text>
                            Documentation
                        </Button>
                        <Button secondary on:click={openToTargets}>Edit message</Button>
                    </div>
                {/if}
            </EmptySearch>
        {/if}
    </svelte:fragment>
</CardGrid>
