<script lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { PageProps } from './$types';
    import {
        type CreateIndexesCallbackType,
        Indexes,
        EmptySheet,
        EmptySheetCards
    } from '$database/(entity)';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

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
</script>

<Indexes {onCreateIndex} {onDeleteIndexes} entity={data.collection}>
    {#snippet emptyIndexesSheetView(toggle)}
        <EmptySheet mode="indexes">
            {#snippet actions()}
                <EmptySheetCards
                    icon={IconPlus}
                    title="Create index"
                    disabled={!data.collection.fields?.length}
                    subtitle="Create indexes manually"
                    onClick={toggle} />
            {/snippet}
        </EmptySheet>
    {/snippet}

    {#snippet emptyEntitiesSheetView(toggle)}
        <EmptySheet mode="indexes" title="You have no indexes yet">
            {#snippet actions()}
                <EmptySheetCards
                    icon={IconPlus}
                    title="Create indexes"
                    subtitle="Create indexes manually"
                    onClick={toggle} />
            {/snippet}
        </EmptySheet>
    {/snippet}
</Indexes>
