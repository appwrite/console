<script lang="ts">
    import type { Models } from '@appwrite.io/console';
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

    export let topics: Models.Topic[];

    let offset = 0;
    const limit = 10;
</script>

<CardGrid>
    <Heading tag="h6" size="7" id="variables">Topics</Heading>
    <svelte:fragment slot="aside">
        {@const sum = topics.length}
        {#if sum}
            <div class="u-flex u-flex-vertical u-gap-24">
                <Table noMargin noStyles>
                    <TableHeader>
                        <TableCellHead>ID</TableCellHead>
                        <TableCellHead>Name</TableCellHead>
                        <TableCellHead>Subscribers</TableCellHead>
                    </TableHeader>
                    <TableBody>
                        {#each topics.slice(offset, offset + limit) as topic (topic.$id)}
                            <TableRow>
                                <TableCell title="id">
                                    <Id value={topic.$id}>{topic.$id}</Id>
                                </TableCell>

                                <TableCellText title="name">
                                    {topic.name}
                                </TableCellText>

                                <TableCellText title="subscribers">
                                    {topic.smsTotal + topic.emailTotal + topic.pushTotal}
                                </TableCellText>
                            </TableRow>
                        {/each}
                    </TableBody>
                </Table>
                <div class="u-flex u-main-space-between">
                    <p class="text">Total topics: {sum}</p>
                    <PaginationInline {sum} {limit} bind:offset />
                </div>
            </div>
        {:else}
            <Empty>Edit the message to add a Topic</Empty>
        {/if}
    </svelte:fragment>
</CardGrid>
