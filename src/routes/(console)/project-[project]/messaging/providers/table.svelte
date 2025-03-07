<script lang="ts">
    import { base } from '$app/paths';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { FloatingActionBar, Id, Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { project } from '$routes/(console)/project-[project]/store';
    import Provider from '../provider.svelte';
    import ProviderType from '../providerType.svelte';
    import { Pill } from '$lib/elements';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sdk } from '$lib/stores/sdk';
    import { canWriteProviders } from '$lib/stores/roles';
    import { Badge, Icon, Selector, Table } from '@appwrite.io/pink-svelte';
    import { IconCheckCircle } from '@appwrite.io/pink-icons-svelte';

    export let data: PageData;

    let selectedIds: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedIds.map((id) => sdk.forProject.messaging.deleteProvider(id));

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

<Table.Root>
    <svelte:fragment slot="header">
        {#if $canWriteProviders}
            <Table.Header.Selector width="40px" />
        {/if}
        {#each $columns as column}
            {#if column.show}
                <Table.Header.Cell width={column.width}>{column.title}</Table.Header.Cell>
            {/if}
        {/each}
    </svelte:fragment>
    {#each data.providers.providers as provider (provider.$id)}
        <Table.Link
            href={$canWriteProviders
                ? `${base}/project-${$project.$id}/messaging/providers/provider-${provider.$id}`
                : '#'}>
            {#if $canWriteProviders}
                <Table.Cell>
                    <Selector.Checkbox size="s" id={provider.$id} />
                </Table.Cell>
            {/if}
            {#each $columns as column}
                {#if column.show}
                    {#if column.id === '$id'}
                        {#key $columns}
                            <Table.Cell>
                                <Id value={provider.$id}>{provider.$id}</Id>
                            </Table.Cell>
                        {/key}
                    {:else if column.id === 'provider'}
                        <Table.Cell>
                            <Provider provider={provider.provider} />
                        </Table.Cell>
                    {:else if column.id === 'type'}
                        <Table.Cell>
                            <ProviderType type={provider.type} size="xs" />
                        </Table.Cell>
                    {:else if column.id === 'enabled'}
                        <Table.Cell>
                            <Badge
                                variant="secondary"
                                type={provider.enabled ? 'success' : undefined}
                                content={provider.enabled ? 'enabled' : 'disabled'}>
                                <svelte:fragment slot="start">
                                    {#if provider.enabled}
                                        <Icon icon={IconCheckCircle} size="s" />
                                    {/if}
                                </svelte:fragment>
                            </Badge>
                        </Table.Cell>
                    {:else}
                        <Table.Cell>
                            {provider[column.id]}
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
        </Table.Link>
    {/each}
</Table.Root>

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
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
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
