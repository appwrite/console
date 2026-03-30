<script lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { type DocumentsDBIndexType } from '@appwrite.io/console';
    import type { PageProps } from './$types';
    import {
        type CreateIndexesCallbackType,
        Indexes,
        EmptySheet,
        EmptySheetCards
    } from '$database/(entity)';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import CreateIndexForm from './createIndex.svelte';

    let { data }: PageProps = $props();

    let createIndexRef: CreateIndexForm;

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
            type: index.type as DocumentsDBIndexType,
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

<Indexes {onCreateIndex} {onDeleteIndexes} entity={data.collection} bind:createIndexRef>
    {#snippet createIndexForm()}
        <CreateIndexForm
            entity={data.collection}
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
