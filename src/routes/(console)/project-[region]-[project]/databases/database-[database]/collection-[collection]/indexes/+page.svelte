<script lang="ts">
    import { page } from '$app/state';
    import type { PageProps } from './$types';
    import {
        type CreateIndexesCallbackType,
        Indexes,
        EmptySheet,
        EmptySheetCards,
        useDatabaseSdk
    } from '$database/(entity)';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import CreateIndexForm from './createIndex.svelte';

    let { data }: PageProps = $props();

    let createIndexRef: CreateIndexForm;

    const databaseSdk = useDatabaseSdk(page.params.region, page.params.project, data.database.type);

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

<Indexes {onCreateIndex} {onDeleteIndexes} entity={data.collection} bind:createIndexRef>
    {#snippet createIndexForm()}
        <CreateIndexForm
            entity={data.collection}
            databaseType={data.database.type}
            {onCreateIndex}
            showCreateIndex={true}
            bind:this={createIndexRef} />
    {/snippet}

    {#snippet emptyIndexesSheetView(toggle)}
        <EmptySheet mode="indexes" type={data.database.type}>
            {#snippet actions()}
                <EmptySheetCards
                    icon={IconPlus}
                    title="Create index"
                    subtitle="Create indexes manually"
                    onClick={toggle} />
            {/snippet}
        </EmptySheet>
    {/snippet}
</Indexes>
