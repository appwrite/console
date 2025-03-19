<script lang="ts">
    import { FloatingActionBar, Id } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import ProviderType from '$routes/(console)/project-[project]/messaging/providerType.svelte';
    import Provider from '$routes/(console)/project-[project]/messaging/provider.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { MessagingProviderType } from '@appwrite.io/console';
    import { Badge, Selector, Table, Typography } from '@appwrite.io/pink-svelte';
    import Confirm from '$lib/components/confirm.svelte';

    export let data: PageData;

    let selectedIds: string[] = [];
    let showDelete = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedIds.map((id) =>
            sdk.forProject.users.deleteTarget($page.params.user, id)
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

<Table.Root>
    <svelte:fragment slot="header">
        <Table.Header.Selector width="40px" />
        {#each $columns as column}
            {#if column.show}
                <Table.Header.Cell width={column.width + 'px'}>{column.title}</Table.Header.Cell>
            {/if}
        {/each}
    </svelte:fragment>
    {#each data.targets.targets as target (target.$id)}
        {@const provider = data.providersById[target.providerId]}
        <Table.Row>
            <Table.Cell>
                <Selector.Checkbox size="s" />
            </Table.Cell>

            {#each $columns as column}
                {#if column.show}
                    {#if column.id === '$id'}
                        {#key $columns}
                            <Table.Cell>
                                <Id value={target[column.id]}>
                                    {target[column.id]}
                                </Id>
                            </Table.Cell>
                        {/key}
                    {:else if column.id === 'target'}
                        <Table.Cell>
                            {#if target.providerType === MessagingProviderType.Push}
                                {target.name}
                            {:else}
                                {target.identifier}
                            {/if}
                        </Table.Cell>
                    {:else if column.id === 'providerType'}
                        <Table.Cell width={column.width + 'px'}>
                            <ProviderType type={target.providerType} size="s" />
                        </Table.Cell>
                    {:else if column.id === 'provider'}
                        <Table.Cell width={column.width + 'px'}>
                            {#if provider}
                                <Provider provider={provider.provider} size="s" />
                            {/if}
                        </Table.Cell>
                    {:else if column.id === '$createdAt'}
                        <Table.Cell width={column.width + 'px'}>
                            {toLocaleDateTime(target[column.id])}
                        </Table.Cell>
                    {:else}
                        <Table.Cell width={column.width + 'px'}>
                            {target[column.id]}
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
        </Table.Row>
    {/each}
</Table.Root>

<FloatingActionBar show={selectedIds.length > 0}>
    <svelte:fragment slot="start">
        <Badge content={selectedIds.length.toString()} />
        <span>
            <span class="is-only-desktop">
                {selectedIds.length > 1 ? 'subscribers' : 'subscriber'}
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
        {selectedIds.length > 1 ? 'targets' : 'target'}?
    </Typography.Text>
</Confirm>
