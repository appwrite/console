<script lang="ts">
    import { FloatingActionBar, Id } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import type { PageData } from './$types';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import type { Column } from '$lib/helpers/types';
    import { oAuthProviders } from '$lib/stores/oauth-providers';
    import { app } from '$lib/stores/app';
    import { base } from '$app/paths';
    import { Badge, Selector, Table, Typography } from '@appwrite.io/pink-svelte';
    import Confirm from '$lib/components/confirm.svelte';

    export let columns: Column[];
    export let data: PageData;

    let selectedIds: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedIds.map((id) => sdk.forProject.users.deleteIdentity(id));

        try {
            await Promise.all(promises);
            trackEvent(Submit.UserIdentityDelete, {
                total: selectedIds.length
            });
            addNotification({
                type: 'success',
                message: `${selectedIds.length} target${selectedIds.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.USER_IDENTITIES);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.UserIdentityDelete);
        } finally {
            selectedIds = [];
            showDelete = false;
        }
    }
</script>

<Table.Root {columns} allowSelection let:root>
    <svelte:fragment slot="header" let:root>
        {#each columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each data.identities.identities as identity (identity.$id)}
        <Table.Row.Base {root}>
            {#each columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === '$id'}
                        {#key columns}
                            <Id value={identity[column.id]}>
                                {identity[column.id]}
                            </Id>
                        {/key}
                    {:else if column.id === 'provider'}
                        {@const provider = oAuthProviders[identity[column.id]]}
                        <div class="u-inline-flex u-cross-center u-gap-8">
                            <div class="avatar is-size-small">
                                <img
                                    style="--p-text-size: 1rem"
                                    height="20"
                                    width="20"
                                    src={`${base}/icons/${$app.themeInUse}/color/${provider.icon}.svg`}
                                    alt={provider.name} />
                            </div>
                            {provider.name}
                        </div>
                    {:else if column.type === 'datetime'}
                        {#if !identity[column.id]}
                            -
                        {:else}
                            {toLocaleDateTime(identity[column.id])}
                        {/if}
                    {:else}
                        {identity[column.id]}
                    {/if}
                </Table.Cell>
            {/each}
        </Table.Row.Base>
    {/each}
</Table.Root>

<FloatingActionBar show={selectedIds.length > 0}>
    <svelte:fragment slot="start">
        <Badge content={selectedIds.length.toString()} />
        <span>
            <span class="is-only-desktop">
                {selectedIds.length > 1 ? 'identities' : 'identity'}
            </span>
            selected
        </span>
    </svelte:fragment>
    <svelte:fragment slot="end">
        <Button text on:click={() => (selectedIds = [])}>Cancel</Button>
        <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
    </svelte:fragment>
</FloatingActionBar>

<Confirm title="Delete Identity" bind:open={showDelete} onSubmit={handleDelete}>
    <Typography.Text>
        Are you sure you want to delete <b>{selectedIds.length}</b>
        {selectedIds.length > 1 ? 'identities' : 'identity'}?
    </Typography.Text>
</Confirm>
