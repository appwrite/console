<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { identities } from './store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { oAuthProviders } from '$lib/stores/oauth-providers';
    import { Card, Empty, Icon, Layout, Table, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconRefresh, IconTrash } from '@appwrite.io/pink-icons-svelte';
    import { reconnectGithubIdentity } from '$lib/helpers/github';
    import DualTimeView from '$lib/components/dualTimeView.svelte';

    // Apps authorized through the OAuth2 server use an `oauth2:<appId>` provider
    // and are managed on the Applications tab; this list is sign-in identities only.
    $: signInIdentities = $identities.filter(
        (identity) => !identity.provider?.startsWith('oauth2:')
    );

    function reconnectIdentity(provider: string) {
        try {
            // the flow redirects away, so track before handing off to GitHub.
            trackEvent(Submit.AccountReconnectIdentity, { provider });
            reconnectGithubIdentity();
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.AccountReconnectIdentity);
        }
    }

    async function deleteIdentity(id: string) {
        try {
            await sdk.forConsole.account.deleteIdentity({ identityId: id });
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
    <svelte:fragment slot="title">Identities</svelte:fragment>
    Identities are your connected GitHub accounts. You can sign in using these accounts.

    <svelte:fragment slot="aside">
        {#if signInIdentities.length === 0}
            <Card.Base padding="none">
                <Empty
                    type="secondary"
                    title="No identities are currently available."
                    description="Once you sign in via GitHub, you'll see
                it here." />
            </Card.Base>
        {:else}
            <Table.Root
                let:root
                columns={[
                    { id: 'provider' },
                    { id: 'email' },
                    { id: 'createdAt' },
                    { id: 'expiryDate' },
                    { id: 'actions', width: 80 }
                ]}>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell column="provider" {root}>Provider</Table.Header.Cell>
                    <Table.Header.Cell column="email" {root}>Email</Table.Header.Cell>
                    <Table.Header.Cell column="createdAt" {root}>Created At</Table.Header.Cell>
                    <Table.Header.Cell column="expiryDate" {root}>Expiry Date</Table.Header.Cell>
                    <Table.Header.Cell column="actions" {root} />
                </svelte:fragment>
                {#each signInIdentities as identity (identity.$id)}
                    {@const provider = oAuthProviders[identity.provider]}
                    <Table.Row.Base {root}>
                        <Table.Cell column="provider" {root}>
                            <Layout.Stack direction="row" alignItems="center">
                                <div class="avatar is-size-small">
                                    <span
                                        class={`icon-${provider.icon}`}
                                        style="font-size: var(--icon-size-medium)!important"></span>
                                </div>
                                {provider.name}
                            </Layout.Stack>
                        </Table.Cell>
                        <Table.Cell column="email" {root}>
                            {identity.providerEmail}
                        </Table.Cell>
                        <Table.Cell column="createdAt" {root}>
                            <DualTimeView time={identity.$createdAt} />
                        </Table.Cell>
                        <Table.Cell column="expiryDate" {root}>
                            {#if identity.providerAccessTokenExpiry}
                                <DualTimeView
                                    time={identity.providerAccessTokenExpiry}
                                    showDatetime />
                            {:else}
                                -
                            {/if}
                        </Table.Cell>
                        <Table.Cell column="actions" {root}>
                            <Layout.Stack direction="row" gap="xxs" alignItems="center">
                                {#if identity.provider === 'github'}
                                    <Tooltip>
                                        <Button
                                            text
                                            icon
                                            ariaLabel="Reconnect GitHub"
                                            on:click={() => reconnectIdentity(identity.provider)}>
                                            <Icon icon={IconRefresh} size="s" />
                                        </Button>
                                        <span slot="tooltip">
                                            Reconnect to refresh this identity’s access
                                        </span>
                                    </Tooltip>
                                {/if}
                                <Button text on:click={() => deleteIdentity(identity.$id)}>
                                    <Icon icon={IconTrash} size="s" />
                                </Button>
                            </Layout.Stack>
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>
        {/if}
    </svelte:fragment>
</CardGrid>
