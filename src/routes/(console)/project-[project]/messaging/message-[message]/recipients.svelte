<script lang="ts">
    import { MessagingProviderType, type Models } from '@appwrite.io/console';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { CardGrid, EmptySearch, Heading, PaginationInline } from '$lib/components';
    import { Button } from '$lib/elements/forms';

    export let message: Models.Message;
    export let selectedRecipients: Record<string, Models.User<Models.Preferences>>;

    let offset = 0;
    const limit = 10;
    let messageRecipients = Object.values(selectedRecipients);

    function getIdentifier(user: Models.User<Models.Preferences>): string {
        switch (message.providerType) {
            case MessagingProviderType.Email:
                return user.email;
            case MessagingProviderType.Sms:
                return user.phone;
            case MessagingProviderType.Push:
                return (
                    user.targets?.find((target) => target.providerType === 'push')?.name ||
                    'Unknown identifier'
                );
        }
        return 'Unknown identifier';
    }
</script>

<CardGrid hideFooter={message.status !== 'draft'}>
    <Heading tag="h6" size="7" id="variables">Users</Heading>
    <svelte:fragment slot="aside">
        {@const sum = messageRecipients.length}
        {#if sum}
            <div class="u-flex u-flex-vertical u-gap-24">
                <Table noMargin noStyles>
                    <TableHeader>
                        <TableCellHead>Name</TableCellHead>
                        <TableCellHead>Identifier</TableCellHead>
                    </TableHeader>
                    <TableBody>
                        {#each messageRecipients.slice(offset, offset + limit) as recipient (recipient.$id)}
                            <TableRow>
                                <TableCell title="Name">
                                    <div class="u-flex u-cross-center">
                                        <span class="body-text-2 u-bold" data-private>
                                            {recipient.name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell title="Identifier">
                                    <span class="body-text-2" data-private>
                                        {getIdentifier(recipient)}
                                    </span>
                                </TableCell>
                            </TableRow>
                        {/each}
                    </TableBody>
                </Table>
                <div class="u-flex u-main-space-between">
                    <p class="text">Total users: {messageRecipients.length}</p>
                    <PaginationInline {sum} {limit} bind:offset />
                </div>
            </div>
        {:else}
            <EmptySearch hidePagination>
                <div class="u-text-center">
                    No users have been selected.
                    <p>
                        Need a hand? Check out our
                        <Button
                            link
                            external
                            href="https://appwrite.io/docs/products/messaging"
                            text>
                            documentation
                        </Button>
                        .
                    </p>
                </div>
            </EmptySearch>
        {/if}
    </svelte:fragment>
</CardGrid>
