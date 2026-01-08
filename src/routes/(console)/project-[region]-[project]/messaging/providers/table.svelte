<script lang="ts">
    import { base } from '$app/paths';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import {
        type DeleteOperationState,
        type DeleteOperation,
        Id,
        MultiSelectionTable
    } from '$lib/components';
    import type { PageData } from './$types';
    import { columns } from './store';
    import Provider from '../provider.svelte';
    import ProviderType from '../providerType.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sdk } from '$lib/stores/sdk';
    import { canWriteProviders } from '$lib/stores/roles';
    import { Badge, Icon, Table } from '@appwrite.io/pink-svelte';
    import { IconCheckCircle } from '@appwrite.io/pink-icons-svelte';
    import { page } from '$app/state';

    const {
        data
    }: {
        data: PageData;
    } = $props();

    async function handleDelete(batchDelete: DeleteOperation): Promise<DeleteOperationState> {
        const result = await batchDelete((id) =>
            sdk
                .forProject(page.params.region, page.params.project)
                .messaging.deleteProvider({ providerId: id })
        );

        try {
            if (result.error) {
                trackError(result.error, Submit.MessagingProviderDelete);
            } else {
                trackEvent(Submit.MessagingProviderDelete, { total: result.deleted.length });
            }
        } finally {
            await invalidate(Dependencies.MESSAGING_PROVIDERS);
        }

        return result;
    }
</script>

<MultiSelectionTable
    resource="provider"
    columns={$columns}
    onDelete={handleDelete}
    allowSelection={$canWriteProviders}>
    {#snippet header(root)}
        {#each $columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    {/snippet}

    {#snippet children(root)}
        {@const TableRowComponent = $canWriteProviders ? Table.Row.Link : Table.Row.Base}
        {#each data.providers.providers as provider (provider.$id)}
            {@const href = $canWriteProviders
                ? `${base}/project-${page.params.region}-${page.params.project}/messaging/providers/provider-${provider.$id}`
                : undefined}
            <TableRowComponent {href} {root} id={provider.$id}>
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
            </TableRowComponent>
        {/each}
    {/snippet}
</MultiSelectionTable>
