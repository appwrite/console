<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { toLocaleDate } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { Badge, Card, Empty, Icon, Layout, Table, Typography } from '@appwrite.io/pink-svelte';
    import { IconTerminal } from '@appwrite.io/pink-icons-svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    function displayName(appId: string, app: Models.App | null): string {
        return app?.name || appId;
    }

    async function revoke(identity: Models.Identity, appId: string, app: Models.App | null) {
        try {
            await sdk.forConsole.account.deleteIdentity({ identityId: identity.$id });
            await invalidate(Dependencies.IDENTITIES);
            trackEvent(Submit.AccountDeleteIdentity);
            addNotification({
                type: 'success',
                message: `Access for ${displayName(appId, app)} has been revoked`
            });
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.AccountDeleteIdentity);
        }
    }
</script>

<Container>
    <Layout.Stack gap="xxs">
        <Typography.Title>Applications</Typography.Title>
        <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
            Applications you've authorized to access your Appwrite account.
        </Typography.Text>
    </Layout.Stack>

    {#if data.connectedApps.length === 0}
        <Card.Base padding="none">
            <Empty type="secondary" title="No applications connected" />
        </Card.Base>
    {:else}
        <Table.Root
            class="responsive-table"
            let:root
            columns={[
                { id: 'app', width: { min: 450 } },
                { id: 'authorized', width: { min: 160 } },
                { id: 'actions', width: 100 }
            ]}>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="app" {root}>Application</Table.Header.Cell>
                <Table.Header.Cell column="authorized" {root}>Authorized</Table.Header.Cell>
                <Table.Header.Cell column="actions" {root} />
            </svelte:fragment>
            {#each data.connectedApps as { identity, appId, app } (identity.$id)}
                <Table.Row.Base {root}>
                    <Table.Cell column="app" {root}>
                        <Layout.Stack direction="row" alignItems="center" gap="m">
                            <div class="avatar is-size-small">
                                {#if app?.logoUri}
                                    <img height="24" width="24" src={app.logoUri} alt={app.name} />
                                {:else}
                                    <Icon icon={IconTerminal} size="s" />
                                {/if}
                            </div>
                            <Layout.Stack gap="none">
                                <Layout.Stack direction="row" alignItems="center" gap="s">
                                    <Typography.Text
                                        variant="m-500"
                                        color="--fgcolor-neutral-primary">
                                        {displayName(appId, app)}
                                    </Typography.Text>
                                    {#if app?.deviceFlow}
                                        <Badge
                                            variant="secondary"
                                            content="Device flow"
                                            size="xs" />
                                    {/if}
                                </Layout.Stack>
                                {#if app?.tagline || app?.description}
                                    <Typography.Caption
                                        variant="400"
                                        color="--fgcolor-neutral-secondary"
                                        truncate>
                                        {app.tagline || app.description}
                                    </Typography.Caption>
                                {/if}
                            </Layout.Stack>
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell column="authorized" {root}>
                        {toLocaleDate(identity.$createdAt)}
                    </Table.Cell>
                    <Table.Cell column="actions" {root}>
                        <Button size="xs" secondary on:click={() => revoke(identity, appId, app)}>
                            Revoke
                        </Button>
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>
    {/if}
</Container>
