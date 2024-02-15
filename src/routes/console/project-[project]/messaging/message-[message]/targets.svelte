<script lang="ts">
    import { MessagingProviderType, type Models } from '@appwrite.io/console';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { CardGrid, Heading, Empty, PaginationInline, Id } from '$lib/components';

    export let targets: Models.Target[];
    export let usersById: Record<string, Models.User<Models.Preferences>>;

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
            <Empty>Edit the message to add a Target</Empty>
        {/if}
    </svelte:fragment>
</CardGrid>
