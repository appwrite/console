<script lang="ts">
    import { type DeleteOperationState, Id, MultiSelectionTable } from '$lib/components';
    import type { PageData } from './$types';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import type { Column } from '$lib/helpers/types';
    import { oAuthProviders } from '$lib/stores/oauth-providers';
    import { app } from '$lib/stores/app';
    import { base } from '$app/paths';
    import { Table } from '@appwrite.io/pink-svelte';
    import { page } from '$app/state';

    let {
        data,
        columns
    }: {
        data: PageData;
        columns: Column[];
    } = $props();

    async function handleDelete(selectedRows: string[]): Promise<DeleteOperationState> {
        const promises = selectedRows.map((id) => {
            return sdk
                .forProject(page.params.region, page.params.project)
                .users.deleteIdentity({ identityId: id });
        });

        try {
            await Promise.all(promises);
            await invalidate(Dependencies.USER_IDENTITIES);

            trackEvent(Submit.UserIdentityDelete, { total: selectedRows.length });
            return true;
        } catch (error) {
            trackError(error, Submit.UserIdentityDelete);
            return error.message;
        }
    }
</script>

<MultiSelectionTable {columns} resource="identity" onDelete={handleDelete}>
    {#snippet header(root)}
        {#each columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    {/snippet}

    {#snippet children(root)}
        {#each data.identities.identities as identity (identity.$id)}
            <Table.Row.Base {root} id={identity.$id}>
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
                                <DualTimeView time={identity[column.id]} />
                            {/if}
                        {:else}
                            {identity[column.id]}
                        {/if}
                    </Table.Cell>
                {/each}
            </Table.Row.Base>
        {/each}
    {/snippet}
</MultiSelectionTable>
