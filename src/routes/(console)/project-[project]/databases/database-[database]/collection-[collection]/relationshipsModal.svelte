<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal, Paginator } from '$lib/components';
    import Id from '$lib/components/id.svelte';
    import { preferences } from '$lib/stores/preferences';
    import type { Models } from '@appwrite.io/console';
    import { Table } from '@appwrite.io/pink-svelte';

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

<Modal bind:show title={selectedRelationship?.key} hideFooter>
    {#if data?.length}
        <Paginator items={data} {limit} let:paginatedItems>
            <Table.Root>
                <svelte:fragment slot="header">
                    <Table.Header.Cell width="150px">Document ID</Table.Header.Cell>
                    {#if args?.length}
                        {#each args as arg}
                            <Table.Header.Cell>{arg}</Table.Header.Cell>
                        {/each}
                    {/if}
                </svelte:fragment>
                {#each paginatedItems as doc}
                    <Table.Link
                        href={`${base}/project-${projectId}/databases/database-${databaseId}/collection-${selectedRelationship.relatedCollection}/document-${doc.$id}`}
                        on:click={() => (show = false)}>
                        <Table.Cell>
                            <Id value={doc.$id}>{doc.$id}</Id>
                        </Table.Cell>
                        {#if args?.length}
                            {#each args as arg}
                                <Table.Cell>{doc[arg]}</Table.Cell>
                            {/each}
                        {/if}
                    </Table.Link>
                {/each}
            </Table.Root>
        </Paginator>
    {/if}
</Modal>
