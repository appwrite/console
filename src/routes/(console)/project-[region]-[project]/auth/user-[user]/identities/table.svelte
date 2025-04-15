<script lang="ts">
    import { FloatingActionBar, Id, Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellCheck,
        TableCellHead,
        TableCellHeadCheck,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
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
    import { page } from '$app/stores';

    export let columns: Column[];
    export let data: PageData;

    let selectedIds: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedIds.map((id) =>
            sdk.forProject($page.params.region, $page.params.project).users.deleteIdentity(id)
        );

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

<TableScroll>
    <TableHeader>
        <TableCellHeadCheck
            bind:selected={selectedIds}
            pageItemsIds={data.identities.identities.map((d) => d.$id)} />
        {#each columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.identities.identities as identity (identity.$id)}
            <TableRow>
                <TableCellCheck bind:selectedIds id={identity.$id} />

                {#each columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            {#key columns}
                                <TableCell title={column.title}>
                                    <Id value={identity[column.id]}>
                                        {identity[column.id]}
                                    </Id>
                                </TableCell>
                            {/key}
                        {:else if column.id === 'provider'}
                            {@const provider = oAuthProviders[identity[column.id]]}
                            <TableCellText title={column.title} width={column.width}>
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
                            </TableCellText>
                        {:else if column.type === 'datetime'}
                            <TableCellText title={column.title} width={column.width}>
                                {#if !identity[column.id]}
                                    -
                                {:else}
                                    {toLocaleDateTime(identity[column.id])}
                                {/if}
                            </TableCellText>
                        {:else}
                            <TableCellText title={column.title} width={column.width}>
                                {identity[column.id]}
                            </TableCellText>
                        {/if}
                    {/if}
                {/each}
            </TableRow>
        {/each}
    </TableBody>
</TableScroll>

<FloatingActionBar show={selectedIds.length > 0}>
    <div class="u-flex u-cross-center u-main-space-between actions">
        <div class="u-flex u-cross-center u-gap-8">
            <span class="indicator body-text-2 u-bold">{selectedIds.length}</span>
            <p>
                <span class="is-only-desktop">
                    {selectedIds.length > 1 ? 'identities' : 'identity'}
                </span>
                selected
            </p>
        </div>

        <div class="u-flex u-cross-center u-gap-8">
            <Button text on:click={() => (selectedIds = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>
                <p>Delete</p>
            </Button>
        </div>
    </div>
</FloatingActionBar>

<Modal
    title="Delete identity"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}
    closable={!deleting}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{selectedIds.length}</b>
        {selectedIds.length > 1 ? 'identities' : 'identity'}?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)} disabled={deleting}>Cancel</Button>
        <Button secondary submit disabled={deleting}>Delete</Button>
    </svelte:fragment>
</Modal>
