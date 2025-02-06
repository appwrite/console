<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { identities } from './store';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { oAuthProviders } from '$lib/stores/oauth-providers';
    import EmptySearch from '$lib/components/emptySearch.svelte';
    import { Icon, Layout, Table } from '@appwrite.io/pink-svelte';
    import { IconTrash } from '@appwrite.io/pink-icons-svelte';

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
    <Heading tag="h2" size="7">Identities</Heading>
    <p class="text">
        Identities are your connected GitHub accounts. You can sign in using these accounts.
    </p>

    <svelte:fragment slot="aside">
        {#if $identities.length === 0}
            <EmptySearch hidePagination>
                <div class="u-text-center">
                    No identities are currently available. Once you sign in via GitHub, you'll see
                    it here.
                </div>
            </EmptySearch>
        {:else}
            <Table.Root>
                <svelte:fragment slot="header">
                    <Table.Header.Cell>Provider</Table.Header.Cell>
                    <Table.Header.Cell>Email</Table.Header.Cell>
                    <Table.Header.Cell>Created At</Table.Header.Cell>
                    <Table.Header.Cell>Expiry Date</Table.Header.Cell>
                    <Table.Header.Cell width="40px" />
                </svelte:fragment>
                {#each $identities as identity (identity.$id)}
                    {@const provider = oAuthProviders[identity.provider]}
                    <Table.Row>
                        <Table.Cell>
                            <Layout.Stack direction="row" alignItems="center">
                                <div class="avatar is-size-small">
                                    <span
                                        class={`icon-${provider.icon}`}
                                        style="font-size: var(--icon-size-medium)!important" />
                                </div>
                                {provider.name}
                            </Layout.Stack>
                        </Table.Cell>
                        <Table.Cell>
                            {identity.providerEmail}
                        </Table.Cell>
                        <Table.Cell>
                            {toLocaleDateTime(identity.$createdAt)}
                        </Table.Cell>
                        <Table.Cell>
                            {toLocaleDateTime(identity.providerAccessTokenExpiry)}
                        </Table.Cell>
                        <Table.Cell>
                            <Button
                                text
                                class="is-only-icon"
                                on:click={() => deleteIdentity(identity.$id)}>
                                <Icon icon={IconTrash} size="s" />
                            </Button>
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Root>
        {/if}
    </svelte:fragment>
</CardGrid>
