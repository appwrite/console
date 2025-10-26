<script lang="ts">
    import { type DeleteOperationState, Id, MultiSelectionTable } from '$lib/components';
    import type { PageData } from './$types';
    import { columns } from './store';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import ProviderType from '$routes/(console)/project-[region]-[project]/messaging/providerType.svelte';
    import Provider from '$routes/(console)/project-[region]-[project]/messaging/provider.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { MessagingProviderType } from '@appwrite.io/console';
    import { Table } from '@appwrite.io/pink-svelte';

    const {
        data
    }: {
        data: PageData;
    } = $props();

    async function handleDelete(selectedRows: string[]): Promise<DeleteOperationState> {
        const promises = selectedRows.map((id) => {
            return sdk
                .forProject(page.params.region, page.params.project)
                .users.deleteTarget({ userId: page.params.user, targetId: id });
        });

        try {
            await Promise.all(promises);
            await invalidate(Dependencies.USER_TARGETS);

            trackEvent(Submit.UserTargetDelete, { total: selectedRows.length });
            return true;
        } catch (error) {
            trackError(error, Submit.UserTargetDelete);
            return error.message;
        }
    }
</script>

<MultiSelectionTable resource="target" columns={$columns} onDelete={handleDelete}>
    {#snippet header(root)}
        {#each $columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    {/snippet}

    {#snippet children(root)}
        {#each data.targets.targets as target (target.$id)}
            {@const provider = data.providersById[target.providerId]}
            <Table.Row.Base {root} id={target.$id}>
                {#each $columns as column}
                    <Table.Cell column={column.id} {root}>
                        {#if column.id === '$id'}
                            {#key $columns}
                                <Id value={target[column.id]}>
                                    {target[column.id]}
                                </Id>
                            {/key}
                        {:else if column.id === 'target'}
                            {#if target.providerType === MessagingProviderType.Push}
                                {target.name}
                            {:else}
                                {target.identifier}
                            {/if}
                        {:else if column.id === 'providerType'}
                            <ProviderType type={target.providerType} size="s" />
                        {:else if column.id === 'provider'}
                            {#if provider}
                                <Provider provider={provider.provider} />
                            {/if}
                        {:else if column.id === '$createdAt'}
                            <DualTimeView time={target[column.id]} />
                        {:else}
                            {target[column.id]}
                        {/if}
                    </Table.Cell>
                {/each}
            </Table.Row.Base>
        {/each}
    {/snippet}
</MultiSelectionTable>
