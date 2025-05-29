<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Id } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import type { PageData } from './$types';
    import { columns } from './store';
    import Provider from '../provider.svelte';
    import ProviderType from '../providerType.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sdk } from '$lib/stores/sdk';
    import { canWriteProviders } from '$lib/stores/roles';
    import { Badge, FloatingActionBar, Icon, Table, Typography } from '@appwrite.io/pink-svelte';
    import { IconCheckCircle } from '@appwrite.io/pink-icons-svelte';
    import Confirm from '$lib/components/confirm.svelte';
    import { page } from '$app/state';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data: PageData;

    let selectedIds: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedIds.map((id) =>
            sdk.forProject(page.params.region, page.params.project).messaging.deleteProvider(id)
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

<Table.Root
    columns={$columns}
    allowSelection={$canWriteProviders}
    let:root
    bind:selectedRows={selectedIds}>
    <svelte:fragment slot="header" let:root>
        {#each $columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each data.providers.providers as provider (provider.$id)}
        <svelte:component
            this={$canWriteProviders ? Table.Row.Link : Table.Row.Base}
            id={provider.$id}
            href={$canWriteProviders
                ? getProjectRoute(`/messaging/providers/provider-${provider.$id}`)
                : undefined}
            {root}>
            {#each $columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === '$id'}
                        {#key $columns}
                            <Id value={provider.$id}>{provider.$id}</Id>
                        {/key}
                    {:else if column.id === 'provider'}
                        <Provider provider={provider.provider} />
                    {:else if column.id === 'type'}
                        <ProviderType type={provider.type} size="xs" />
                    {:else if column.id === 'enabled'}
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
                    {:else}
                        {provider[column.id]}
                    {/if}
                </Table.Cell>
            {/each}
        </svelte:component>
    {/each}
</Table.Root>

{#if selectedIds.length > 0}
    <FloatingActionBar>
        <svelte:fragment slot="start">
            <Badge content={selectedIds.length.toString()} />
            <span>
                {selectedIds.length > 1 ? 'providers' : 'provider'}
                selected
            </span>
        </svelte:fragment>
        <svelte:fragment slot="end">
            <Button text on:click={() => (selectedIds = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </FloatingActionBar>
{/if}

<Confirm
    title="Delete providers"
    bind:open={showDelete}
    onSubmit={handleDelete}
    disabled={deleting}>
    <Typography.Text>
        Are you sure you want to delete <b>{selectedIds.length}</b>
        {selectedIds.length > 1 ? 'providers' : 'provider'}?
    </Typography.Text>
</Confirm>
