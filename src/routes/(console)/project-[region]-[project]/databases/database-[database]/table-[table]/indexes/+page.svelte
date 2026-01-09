<script lang="ts">
    import { page } from '$app/state';
    import { onDestroy } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { isCloud } from '$lib/system';
    import type { PageProps } from './$types';
    import { canWriteTables } from '$lib/stores/roles';
    import { Typography, Link } from '@appwrite.io/pink-svelte';
    import IconAI from '../../(suggestions)/icon/aiForButton.svelte';
    import { showCreateColumnSheet } from '$database/table-[table]/store';
    import { IconBookOpen, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { showIndexesSuggestions, showColumnsSuggestionsModal } from '$database/(suggestions)';
    import {
        type CreateIndexesCallbackType,
        Indexes,
        EmptySheet,
        EmptySheetCards
    } from '$database/(entity)';

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

    onDestroy(() => ($showCreateColumnSheet.show = false));
</script>

<Indexes {onCreateIndex} {onDeleteIndexes} entity={data.table}>
    {#snippet emptyIndexesSheetView(toggle)}
        <EmptySheet mode="indexes" showActions={$canWriteTables}>
            {#snippet subtitle()}
                {#if isCloud}
                    <Typography.Text align="center">
                        Need a hand? Learn more in the
                        <Link.Anchor
                            target="_blank"
                            href="https://appwrite.io/docs/products/databases/tables#indexes">
                            docs.
                        </Link.Anchor>
                    </Typography.Text>
                {/if}
            {/snippet}

            {#snippet actions()}
                {#if isCloud}
                    <EmptySheetCards
                        icon={IconAI}
                        title="Suggest indexes"
                        disabled={!data.table?.fields?.length}
                        subtitle="Use AI to generate indexes"
                        onClick={() => {
                            showIndexesSuggestions.update(() => true);
                        }} />
                {/if}

                <EmptySheetCards
                    icon={IconPlus}
                    title="Create index"
                    disabled={!data.table?.fields?.length}
                    subtitle="Create indexes manually"
                    onClick={toggle} />

                {#if !isCloud}
                    <EmptySheetCards
                        icon={IconBookOpen}
                        title="Documentation"
                        subtitle="Read the Appwrite docs"
                        href="https://appwrite.io/docs/products/databases/tables#indexes" />
                {/if}
            {/snippet}
        </EmptySheet>
    {/snippet}

    {#snippet emptyEntitiesSheetView()}
        <EmptySheet mode="indexes" title="You have no columns yet" showActions={$canWriteTables}>
            {#snippet subtitle()}
                {#if isCloud}
                    <Typography.Text align="center">
                        Need a hand? Learn more in the
                        <Link.Anchor
                            target="_blank"
                            href="https://appwrite.io/docs/products/databases/tables#columns">
                            docs.
                        </Link.Anchor>
                    </Typography.Text>
                {/if}
            {/snippet}

            {#snippet actions()}
                {#if isCloud}
                    <EmptySheetCards
                        icon={IconAI}
                        title="Suggest columns"
                        subtitle="Use AI to generate columns"
                        onClick={() => {
                            $showColumnsSuggestionsModal = true;
                        }} />

                    <EmptySheetCards
                        icon={IconPlus}
                        title="Create column"
                        subtitle="Create columns manually"
                        onClick={() => {
                            $showCreateColumnSheet.show = true;
                        }} />
                {:else}
                    <EmptySheetCards
                        icon={IconPlus}
                        title="Create column"
                        subtitle="Create columns manually"
                        onClick={() => {
                            $showCreateColumnSheet.show = true;
                        }} />

                    <EmptySheetCards
                        icon={IconBookOpen}
                        title="Documentation"
                        subtitle="Read the Appwrite docs"
                        href="https://appwrite.io/docs/products/databases/tables#columns" />
                {/if}
            {/snippet}
        </EmptySheet>
    {/snippet}
</Indexes>
