<script lang="ts">
    import { page } from '$app/state';
    import type { PageProps } from './$types';
    import {
        type CreateIndexesCallbackType,
        type DatabaseType,
        Indexes,
        EmptySheet,
        EmptySheetCards,
        useDatabaseSdk
    } from '$database/(entity)';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    let { data }: PageProps = $props();

    const databaseSdk = useDatabaseSdk(
        page.params.region,
        page.params.project,
        data.database.type as DatabaseType
    );

    async function onCreateIndex(index: CreateIndexesCallbackType) {
        await databaseSdk.createIndex({
            databaseId: page.params.database,
            entityId: page.params.collection,
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
                databaseSdk.deleteIndex({
                    databaseId: page.params.database,
                    entityId: page.params.collection,
                    key
                })
            )
        );
    }
</script>

<Indexes {onCreateIndex} {onDeleteIndexes} entity={data.collection}>
    {#snippet emptyIndexesSheetView(toggle)}
        <EmptySheet mode="indexes" type={data.database.type as DatabaseType}>
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
</Indexes>
