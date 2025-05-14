<script lang="ts">
    import { Id } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import ProviderType from '$routes/(console)/project-[region]-[project]/messaging/providerType.svelte';
    import Provider from '$routes/(console)/project-[region]-[project]/messaging/provider.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { MessagingProviderType } from '@appwrite.io/console';
    import { Badge, FloatingActionBar, Table, Typography } from '@appwrite.io/pink-svelte';
    import Confirm from '$lib/components/confirm.svelte';

    export let data: PageData;

    let selectedIds: string[] = [];
    let showDelete = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedIds.map((id) =>
            sdk
                .forProject(page.params.region, page.params.project)
                .users.deleteTarget(page.params.user, id)
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

<Table.Root columns={$columns} allowSelection let:root bind:selectedRows={selectedIds}>
    <svelte:fragment slot="header" let:root>
        {#each $columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
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
                        {toLocaleDateTime(target[column.id])}
                    {:else}
                        {target[column.id]}
                    {/if}
                </Table.Cell>
            {/each}
        </Table.Row.Base>
    {/each}
</Table.Root>

{#if selectedIds.length > 0}
    <FloatingActionBar>
        <svelte:fragment slot="start">
            <Badge content={selectedIds.length.toString()} />
            <span>
                {selectedIds.length > 1 ? 'subscribers' : 'subscriber'}
                selected
            </span>
        </svelte:fragment>
        <svelte:fragment slot="end">
            <Button text on:click={() => (selectedIds = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </FloatingActionBar>
{/if}

<Confirm title="Delete Identity" bind:open={showDelete} onSubmit={handleDelete}>
    <Typography.Text>
        Are you sure you want to delete <b>{selectedIds.length}</b>
        {selectedIds.length > 1 ? 'targets' : 'target'}?
    </Typography.Text>
</Confirm>
