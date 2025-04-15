<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { showCreate } from '../store';
    import type { PageData } from './$types';
    import { showSubNavigation } from '$lib/stores/layout';

    $: data = $page.data as PageData;
    $: project = $page.params.project;
    $: databaseId = $page.params.database;
    $: collectionId = $page.params.collection;

    $: sortedCollections = data?.allCollections?.collections?.sort((a, b) =>
        a.name.localeCompare(b.name)
    );
</script>

<section class="drop-section u-flex-vertical u-gap-8">
    <a
        class="u-flex u-cross-center u-sep-block-end u-padding-block-12 is-not-desktop"
        href={`${base}/project-${$page.params.region}-${project}/databases/database-${databaseId}?openNavbar=true`}>
        <span class="icon-cheveron-left" aria-hidden="true" />
        <h5 class="eyebrow-heading-3 u-margin-inline-auto">Collections</h5>
    </a>
    <h5 class="eyebrow-heading-3 u-padding-block-12 is-not-mobile">Collections</h5>
    <button
        class="button is-text is-full-width u-main-start u-padding-inline-0"
        on:click={() => {
            $showCreate = true;
            $showSubNavigation = false;
        }}>
        <span class="icon-plus" aria-hidden="true" />
        <span class="text">Create collection</span>
    </button>
    {#if data?.allCollections?.total}
        <ul class="drop-list">
            {#each sortedCollections as collection}
                {@const href = `${base}/project-${$page.params.region}-${project}/databases/database-${databaseId}/collection-${collection.$id}`}
                {@const isSelected = collectionId === collection.$id}
                <li class="drop-list-item">
                    <a class="drop-button" class:is-selected={isSelected} {href}>
                        <span class="text" data-private>{collection.name}</span>
                    </a>
                </li>
            {/each}
        </ul>
    {/if}
</section>
