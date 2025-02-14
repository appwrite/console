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
        a.name.localeCompare(b.name)
    );
</script>

<Sidebar.Base state="open" resizable={false}>
    <section slot="top" style:width="100%">
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
        {#if data?.allCollections?.total}
            <ul
                class="drop-list u-padding-inline-start-4 u-margin-inline-start-20 u-margin-block-start-8">
                {#each sortedCollections as collection}
                    {@const href = `${base}/project-${project}/databases/database-${databaseId}/collection-${collection.$id}`}
                    {@const isSelected = collectionId === collection.$id}
                    <li class:is-selected={isSelected}>
                        <a
                            class="u-padding-block-8 u-padding-inline-12 u-flex u-cross-center u-gap-8"
                            {href}>
                            <Icon icon={IconTable} size="s" />
                            <span class="text" data-private>{collection.name}</span>
                        </a>
                    </li>
                {/each}
            </ul>
        {/if}
        <button
            class="body-text-2 u-block u-margin-block-start-8 is-full-width u-padding-inline-0"
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

    .drop-list {
        border-left: 1px solid var(--color-border-neutral, #ededf0);

        .is-selected {
            border-radius: var(--border-radius-xs, 4px);
            background: var(--color-bgcolor-neutral-tertiary, #fafafb);
        }
    }
</style>
