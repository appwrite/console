<script lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { PageProps } from './$types';
    import EmptySheet from '../layout/emptySheet.svelte';
    import { showCreateColumnSheet } from '$database/table-[table]/store';
    import { type CreateIndexesCallbackType, Indexes } from '$database/(entity)';

    let { data }: PageProps = $props();

    const params = $derived({
        databaseId: page.params.database,
        tableId: page.params.table
    });

    const tablesDB = $derived(sdk.forProject(page.params.region, page.params.project).tablesDB);

    async function onCreateIndex(index: CreateIndexesCallbackType) {
        await tablesDB.createIndex({
            ...params,
            key: index.key,
            type: index.type,
            columns: index.fields,
            lengths: index.lengths,
            orders: index.orders
        });
    }

    async function onDeleteIndexes(selectedKeys: string[]) {
        await Promise.all(
            selectedKeys.map((key) =>
                tablesDB.deleteIndex({
                    ...params,
                    key
                })
            )
        );
    }
</script>

<Indexes
    {onCreateIndex}
    {onDeleteIndexes}
    entity={data.table}
    showCreateColumnSheet={$showCreateColumnSheet.show}>
    {#snippet emptyIndexesSheetView(toggle)}
        <EmptySheet
            mode="indexes"
            actions={{
                primary: {
                    onClick: toggle,
                    disabled: !data.table.columns?.length
                }
            }} />
    {/snippet}

    {#snippet emptyColumnsSheetView(toggle)}
        <EmptySheet
            mode="indexes"
            title="You have no columns yet"
            actions={{
                primary: {
                    text: 'Create columns',
                    onClick: toggle
                }
            }} />
    {/snippet}
</Indexes>
