<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { showCreate } from '../store';
    import type { PageData } from './$types';
    import { showSubNavigation } from '$lib/stores/layout';
    import { Icon, Sidebar } from '@appwrite.io/pink-svelte';
    import { IconDatabase, IconTable } from '@appwrite.io/pink-icons-svelte';

    $: data = $page.data as PageData;
    $: project = $page.params.project;
    $: databaseId = $page.params.database;
    $: collectionId = $page.params.collection;

    $: sortedCollections = data?.allCollections?.collections?.sort((a, b) =>
        a.$createdAt > b.$createdAt ? -1 : 1
    );
</script>

<Sidebar.Base state="open" resizable={false}>
    <section class="list-container" slot="top" style:width="100%">
        <a
            class="u-flex u-cross-center u-sep-block-end u-padding-block-12 is-not-desktop"
            href={`${base}/project-${project}/databases/database-${databaseId}?openNavbar=true`}>
            <span class="icon-cheveron-left" aria-hidden="true" />
            <h5 class="eyebrow-heading-3 u-margin-inline-auto">Collections</h5>
        </a>
        <h5
            class="database-name u-flex u-cross-center body-text-2 u-gap-8 u-padding-inline-12 u-padding-block-8 is-not-mobile is-selected">
            <Icon icon={IconDatabase} size="s" color="light-neutral" />
            {data.database.name}
        </h5>
        <div class="collection-content">
            {#if data?.allCollections?.total}
                <ul
                    class="drop-list u-padding-inline-8 u-margin-inline-start-20 u-margin-block-start-8">
                    {#each sortedCollections as collection}
                        {@const href = `${base}/project-${project}/databases/database-${databaseId}/collection-${collection.$id}`}
                        {@const isSelected = collectionId === collection.$id}
                        <li class:is-selected={isSelected}>
                            <a
                                class="u-padding-block-4 u-padding-inline-12 u-flex u-cross-center u-gap-8"
                                {href}>
                                <Icon icon={IconTable} size="s" />
                                <span class="text collection-name" data-private
                                    >{collection.name}</span>
                            </a>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
        <button
            class="new-button body-text-2 u-gap-8 u-margin-inline-start-12 u-flex u-cross-center u-margin-block-start-16 is-full-width u-padding-inline-0"
            on:click={() => {
                $showCreate = true;
                $showSubNavigation = false;
            }}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create collection</span>
        </button>
    </section>
</Sidebar.Base>

<style lang="scss">
    .database-name {
        border-radius: var(--border-radius-xs, 4px);
        background: var(--color-bgcolor-neutral-default, #fafafb);
    }

    .list-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
    }

    .collection-content {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        margin-bottom: auto;

        scrollbar-width: thin;
        scrollbar-color: var(--color-border-neutral, #ededf0) transparent;

        &::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 2px;
        }

        &::-webkit-scrollbar-thumb {
            background: var(--color-border-neutral, #ededf0);
            border-radius: 2px;

            &:hover {
                background: var(--color-border-neutral-emphasis, #dbdbdf);
            }
        }
    }

    .drop-list {
        border-left: 1px solid var(--color-border-neutral, #ededf0);
        flex: 1;

        .is-selected {
            border-radius: var(--border-radius-xs, 4px);
            background: var(--color-bgcolor-neutral-tertiary, #fafafb);
        }

        .collection-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-clamp: 1;
        }
    }

    .new-button {
        flex-shrink: 0;
    }
</style>
