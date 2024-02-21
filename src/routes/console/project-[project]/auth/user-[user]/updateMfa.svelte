<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import EmptySearch from '$lib/components/emptySearch.svelte';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { userFactors } from './store';
</script>

<CardGrid>
    <Heading tag="h6" size="7">Multi-factor authentication</Heading>
    <p class="text">MFA allow users to enhance the security of their account in you app.</p>
    <svelte:fragment slot="aside">
        {#if $userFactors.totp}
            <Table noMargin noStyles transparent>
                <TableHeader>
                    <TableCellHead>Authenticator</TableCellHead>
                    <TableCellHead width={40} />
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCellText title="Authenticator">TOTP (One-time code)</TableCellText>
                        <TableCell>
                            <Button round text ariaLabel="Delete authenticator">
                                <span class="icon-trash" aria-hidden="true" />
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Button disabled text noMargin>
                <span class="icon-plus" />
                <span class="text">Add authentication factor</span>
            </Button>
        {:else}
            <EmptySearch hidePagination hidePages>
                <p class="text u-text-center">
                    No authenticators have been enabled. Once the user adds an authenticator, you’ll
                    see it here.
                </p>
            </EmptySearch>
        {/if}
    </svelte:fragment>
</CardGrid>
