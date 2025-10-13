<script lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { PageProps } from './$types';
    import { showCreateColumnSheet } from '$database/table-[table]/store';
    import { type CreateIndexesCallbackType, Indexes, EmptySheet } from '$database/(entity)';
    import { onDestroy } from 'svelte';

    let { data }: PageProps = $props();

    const params = $derived({
        databaseId: page.params.database,
        collectionId: page.params.collection
    });

    const documentsDB = $derived(
        sdk.forProject(page.params.region, page.params.project).documentsDB
    );

    async function onCreateIndex(index: CreateIndexesCallbackType) {
        await documentsDB.createIndex({
            ...params,
            key: index.key,
            type: index.type,
            attributes: index.fields,
            lengths: index.lengths,
            orders: index.orders
        });
    }

    async function onDeleteIndexes(selectedKeys: string[]) {
        await Promise.all(
            selectedKeys.map((key) =>
                documentsDB.deleteIndex({
                    ...params,
                    key
                })
            )
        );
    }

    onDestroy(() => ($showCreateColumnSheet.show = false));
</script>

<Indexes {onCreateIndex} {onDeleteIndexes} entity={data.collection}>
    {#snippet emptyIndexesSheetView(toggle)}
        <EmptySheet
            mode="indexes"
            actions={{
                primary: {
                    onClick: toggle,
                    disabled: !data.collection.fields?.length
                }
            }} />
    {/snippet}

    {#snippet emptyEntitiesSheetView(toggle)}
        <EmptySheet
            mode="indexes"
            title="You have no indexes yet"
            actions={{
                primary: {
                    text: 'Create indexes',
                    onClick: toggle
                }
            }} />
    {/snippet}
</Indexes>
