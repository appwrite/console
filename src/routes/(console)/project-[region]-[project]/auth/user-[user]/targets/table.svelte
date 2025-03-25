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
    import { columns } from './store';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import ProviderType from '$routes/(console)/project-[region]-[project]/messaging/providerType.svelte';
    import Provider from '$routes/(console)/project-[region]-[project]/messaging/provider.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { MessagingProviderType } from '@appwrite.io/console';

    export let data: PageData;

    let selectedIds: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedIds.map((id) =>
            sdk
                .forProject($page.params.region, $page.params.project)
                .users.deleteTarget($page.params.user, id)
        );

        try {
            await Promise.all(promises);
            trackEvent(Submit.UserTargetDelete, {
                total: selectedIds.length
            });
            addNotification({
                type: 'success',
                message: `${selectedIds.length} target${selectedIds.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.USER_TARGETS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.UserTargetDelete);
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
            pageItemsIds={data.targets.targets.map((d) => d.$id)} />
        {#each $columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.targets.targets as target (target.$id)}
            {@const provider = data.providersById[target.providerId]}
            <TableRow>
                <TableCellCheck bind:selectedIds id={target.$id} />

                {#each $columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            {#key $columns}
                                <TableCell title={column.title}>
                                    <Id value={target[column.id]}>
                                        {target[column.id]}
                                    </Id>
                                </TableCell>
                            {/key}
                        {:else if column.id === 'target'}
                            <TableCell title={column.title}>
                                {#if target.providerType === MessagingProviderType.Push}
                                    {target.name}
                                {:else}
                                    {target.identifier}
                                {/if}
                            </TableCell>
                        {:else if column.id === 'providerType'}
                            <TableCellText title={column.title} width={column.width}>
                                <ProviderType type={target.providerType} size="s" />
                            </TableCellText>
                        {:else if column.id === 'provider'}
                            <TableCellText title={column.title} width={column.width}>
                                {#if provider}
                                    <Provider provider={provider.provider} size="s" />
                                {/if}
                            </TableCellText>
                        {:else if column.id === '$createdAt'}
                            <TableCellText title={column.title} width={column.width}>
                                {toLocaleDateTime(target[column.id])}
                            </TableCellText>
                        {:else}
                            <TableCellText title={column.title} width={column.width}>
                                {target[column.id]}
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
                    {selectedIds.length > 1 ? 'subscribers' : 'subscriber'}
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
    title="Delete target"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}
    closable={!deleting}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{selectedIds.length}</b>
        {selectedIds.length > 1 ? 'targets' : 'target'}?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)} disabled={deleting}>Cancel</Button>
        <Button secondary submit disabled={deleting}>Delete</Button>
    </svelte:fragment>
</Modal>
