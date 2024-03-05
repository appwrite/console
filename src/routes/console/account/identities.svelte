<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
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
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { identities } from './store';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { oAuthProviders } from '$lib/stores/oauth-providers';
    import EmptySearch from '$lib/components/emptySearch.svelte';

    async function deleteIdentity(id: string) {
        try {
            await sdk.forConsole.account.deleteIdentity(id);
            addNotification({
                message: 'Identity has been deleted',
                type: 'success'
            });
            await invalidate(Dependencies.IDENTITIES);
            trackEvent(Submit.AccountDeleteIdentity);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.AccountDeleteIdentity);
        }
    }
</script>

<CardGrid>
    <Heading tag="h6" size="7">Identities</Heading>
    <p class="text">
        Identities are your connected OAuth accounts. You can log in using these identities.
    </p>

    <svelte:fragment slot="aside">
        {#if $identities.length === 0}
            <EmptySearch hidePagination>
                <div class="u-text-center">
                    No accounts are currently available. Once you log in via GitHub, you'll see it
                    here.
                </div>
            </EmptySearch>
        {:else}
            <Table noMargin noStyles>
                <TableHeader>
                    <TableCellHead width={100}>Provider</TableCellHead>
                    <TableCellHead>Email</TableCellHead>
                    <TableCellHead>Created At</TableCellHead>
                    <TableCellHead>Expiry Date</TableCellHead>
                    <TableCellHead width={40} />
                </TableHeader>
                <TableBody>
                    {#each $identities as identity (identity.$id)}
                        {@const provider = oAuthProviders[identity.provider]}
                        <TableRow>
                            <TableCell title="Provider">
                                <div class="u-flex u-gap-8 u-cross-center">
                                    <div class="avatar is-size-small">
                                        <span
                                            class={`icon-${provider.icon}`}
                                            style="font-size: var(--icon-size-medium)!important" />
                                    </div>
                                    {provider.name}
                                </div>
                            </TableCell>
                            <TableCellText title="Email">
                                {identity.providerEmail}
                            </TableCellText>
                            <TableCellText title="Created at">
                                {toLocaleDateTime(identity.$createdAt)}
                            </TableCellText>
                            <TableCellText title="Expiry date">
                                {toLocaleDateTime(identity.providerAccessTokenExpiry)}
                            </TableCellText>
                            <TableCell title="Remove">
                                <Button
                                    text
                                    class="is-only-icon"
                                    on:click={() => deleteIdentity(identity.$id)}
                                    ><span class="icon-trash" aria-hidden="true" /></Button>
                            </TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
        {/if}
    </svelte:fragment>
</CardGrid>
