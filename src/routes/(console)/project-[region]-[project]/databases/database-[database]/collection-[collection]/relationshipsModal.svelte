<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { ClickableList, ClickableListItem, Modal, Paginator } from '$lib/components';
    import { preferences } from '$lib/stores/preferences';
    import type { Models } from '@appwrite.io/console';

    export let show = false;
    export let data: [];
    export let selectedRelationship: Models.AttributeRelationship = null;
    const projectId = $page.params.project;
    const databaseId = $page.params.database;
    const limit = 10;

    $: args =
        preferences
            .getDisplayNames()
            ?.[selectedRelationship?.relatedCollection]?.filter((p) => p !== '$id') ?? [];

    $: if (!show) {
        data = null;
        selectedRelationship = null;
    }
</script>

<Modal size="big" bind:show icon="relationship" headerDivider={false}>
    <svelte:fragment slot="title">
        <span data-private>
            {selectedRelationship.key}
        </span>
    </svelte:fragment>

    {#if data?.length}
        <Paginator items={data} {limit} let:paginatedItems>
            <ClickableList>
                {#each paginatedItems as doc}
                    <ClickableListItem
                        href={`${base}/project-${$page.params.region}-${projectId}/databases/database-${databaseId}/collection-${selectedRelationship.relatedCollection}/document-${doc.$id}`}
                        on:click={() => (show = false)}>
                        {#if args?.length}
                            {#each args as arg, i}
                                {#if i}
                                    <span class="clickable-list-title-sep">|</span>
                                {/if}
                                <span data-private>{doc[arg]}</span>
                            {/each}
                        {/if}
                        <svelte:fragment slot="desc">
                            {doc.$id}
                        </svelte:fragment>
                    </ClickableListItem>
                {/each}
            </ClickableList>
        </Paginator>
    {/if}
    <svelte:fragment slot="footer" />
</Modal>
