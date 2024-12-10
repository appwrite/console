<script lang="ts">
    import { base } from '$app/paths';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
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
        TableRowLink,
        TableScroll
    } from '$lib/elements/table';
    import { addNotification } from '$lib/stores/notifications';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { project } from '$routes/(console)/project-[region]-[project]/store';
    import Provider from '../provider.svelte';
    import ProviderType from '../providerType.svelte';
    import { Pill } from '$lib/elements';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sdk } from '$lib/stores/sdk';
    import { canWriteProviders } from '$lib/stores/roles';
    import { page } from '$app/stores';

    export let data: PageData;

    let selectedIds: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedIds.map((id) =>
            sdk.forProject($page.params.region, $page.params.project).messaging.deleteProvider(id)
        );

        try {
            await Promise.all(promises);
            trackEvent(Submit.MessagingProviderDelete, {
                total: selectedIds.length
            });
            addNotification({
                type: 'success',
                message: `${selectedIds.length} provider${
                    selectedIds.length > 1 ? 's' : ''
                } deleted`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingProviderDelete);
        } finally {
            invalidate(Dependencies.MESSAGING_PROVIDERS);
            selectedIds = [];
            showDelete = false;
        }
    }
</script>

<TableScroll>
    <TableHeader>
        {#if $canWriteProviders}
            <TableCellHeadCheck
                bind:selected={selectedIds}
                pageItemsIds={data.providers.providers.map((d) => d.$id)} />
        {/if}
        {#each $columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.providers.providers as provider (provider.$id)}
            <TableRowLink
                href={$canWriteProviders
                    ? `${base}/project-${$project.region}-${$project.$id}/messaging/providers/provider-${provider.$id}`
                    : '#'}>
                {#if $canWriteProviders}
                    <TableCellCheck bind:selectedIds id={provider.$id} />
                {/if}
                {#each $columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            {#key $columns}
                                <TableCell title={column.title} width={column.width}>
                                    <Id value={provider.$id}>{provider.$id}</Id>
                                </TableCell>
                            {/key}
                        {:else if column.id === 'provider'}
                            <TableCellText title={column.title} width={column.width}>
                                <Provider provider={provider.provider} size="s" />
                            </TableCellText>
                        {:else if column.id === 'type'}
                            <TableCellText title={column.title} width={column.width}>
                                <ProviderType type={provider.type} size="s" />
                            </TableCellText>
                        {:else if column.id === 'enabled'}
                            <TableCellText title={column.title} width={column.width}>
                                <Pill success={provider.enabled}>
                                    {#if provider.enabled}
                                        <span class="icon-check-circle" aria-hidden="true"></span>
                                    {/if}
                                    <span class="text u-trim">
                                        {provider.enabled ? 'enabled' : 'disabled'}
                                    </span>
                                </Pill>
                            </TableCellText>
                        {:else}
                            <TableCellText title={column.title} width={column.width}>
                                {provider[column.id]}
                            </TableCellText>
                        {/if}
                    {/if}
                {/each}
            </TableRowLink>
        {/each}
    </TableBody>
</TableScroll>

<FloatingActionBar show={selectedIds.length > 0}>
    <div class="u-flex u-cross-center u-main-space-between actions">
        <div class="u-flex u-cross-center u-gap-8">
            <span class="indicator body-text-2 u-bold">{selectedIds.length}</span>
            <p>
                <span class="is-only-desktop">
                    {selectedIds.length > 1 ? 'providers' : 'provider'}
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
    title="Delete providers"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}
    closable={!deleting}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{selectedIds.length}</b>
        {selectedIds.length > 1 ? 'providers' : 'provider'}?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)} disabled={deleting}>Cancel</Button>
        <Button secondary submit disabled={deleting}>Delete</Button>
    </svelte:fragment>
</Modal>
