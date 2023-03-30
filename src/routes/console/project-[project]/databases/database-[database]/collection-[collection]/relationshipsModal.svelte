<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal, PaginationInline } from '$lib/components';
    import { TableCell, TableList, TableRowLink } from '$lib/elements/table';
    import { teamPrefs } from '$lib/stores/team';
    import type { Models } from '@appwrite.io/console';

    export let show = false;
    export let data: Models.Document[];
    export let selectedRelationship: Models.AttributeRelationship = null;
    const projectId = $page.params.project;
    const databaseId = $page.params.database;
    const limit = 10;
    let offset = 0;

    $: args = $teamPrefs?.displayNames?.[selectedRelationship?.relatedCollection];

    $: if (!show) {
        data = null;
        selectedRelationship = null;
    }
</script>

<Modal size="big" bind:show icon="relationship" headerDivider={false}>
    <svelte:fragment slot="header">
        {selectedRelationship.key}
    </svelte:fragment>
    <TableList>
        {#each data as doc, i}
            {#if i >= offset && i < offset + limit}
                <TableRowLink
                    href={`${base}/console/project-${projectId}/databases/database-${databaseId}/collection-${selectedRelationship.relatedCollection}`}
                    on:click={() => (show = false)}>
                    <TableCell title={doc.$id}>
                        <div class="u-flex u-gap-8">
                            {#each args as arg, i}
                                {#if i}
                                    <span class="u-color-text-gray">|</span>
                                {/if}
                                <span>{doc[arg]}</span>
                            {/each}
                        </div>
                        <span class="u-color-text-gray u-small">{doc.$id}</span>
                    </TableCell>
                </TableRowLink>
            {/if}
        {/each}
    </TableList>
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {data?.length ?? 0}</p>
        <PaginationInline {limit} bind:offset sum={data?.length ?? 0} hidePages />
    </div>

    <svelte:fragment slot="footer" />
</Modal>
