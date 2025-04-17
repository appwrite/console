<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Modal, Paginator } from '$lib/components';
    import Id from '$lib/components/id.svelte';
    import { preferences } from '$lib/stores/preferences';
    import type { Models } from '@appwrite.io/console';
    import { Table } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let data: Partial<Models.Document>[];
    export let selectedRelationship: Models.AttributeRelationship = null;
    const projectId = page.params.project;
    const databaseId = page.params.database;
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
        <Paginator items={data} {limit}>
            {#snippet children(paginatedItems: typeof data)}
                <Table.Root
                    let:root
                    columns={[{ id: '$id', width: 150 }, ...args.map((id) => ({ id }))]}>
                    <svelte:fragment slot="header" let:root>
                        <Table.Header.Cell column="$id" {root}>Document ID</Table.Header.Cell>
                        {#if args?.length}
                            {#each args as arg}
                                <Table.Header.Cell column={arg} {root}>{arg}</Table.Header.Cell>
                            {/each}
                        {/if}
                    </svelte:fragment>
                    {#each paginatedItems as doc}
                        <Table.Row.Link
                            {root}
                            href={`${base}/project-${projectId}/databases/database-${databaseId}/collection-${selectedRelationship.relatedCollection}/document-${doc.$id}`}
                            on:click={() => (show = false)}>
                            <Table.Cell column="$id" {root}>
                                <Id value={doc.$id}>{doc.$id}</Id>
                            </Table.Cell>
                            {#if args?.length}
                                {#each args as arg}
                                    <Table.Cell column={arg} {root}>{doc[arg]}</Table.Cell>
                                {/each}
                            {/if}
                        </Table.Row.Link>
                    {/each}
                </Table.Root>
            {/snippet}
        </Paginator>
    {/if}
</Modal>
