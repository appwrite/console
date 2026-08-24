<script lang="ts">
    import { page } from '$app/state';
    import { Table } from '@appwrite.io/pink-svelte';
    import MultiSelectionTable from '../multiSelectTable.svelte';

    let {
        pages,
        onDeleteIds
    }: { pages: Record<string, string[]>; onDeleteIds: (ids: string[]) => void } = $props();

    // rows follow the url the way a `+page.ts` load function does
    const rows = $derived(pages[page.url.searchParams.get('page') ?? '1']);
</script>

<MultiSelectionTable
    resource="file"
    confirmDeletion={false}
    columns={[{ id: 'id' }]}
    onDelete={(_batchDelete, selectedRows) => {
        onDeleteIds([...selectedRows]);
        return { deleted: [] };
    }}>
    {#snippet header(root)}
        <Table.Header.Cell column="id" {root}>Id</Table.Header.Cell>
    {/snippet}

    {#snippet children(root)}
        <!-- deliberately unkeyed, the way the console rendered file rows when this bug landed -->
        {#each rows as id}
            <Table.Row.Base {root} {id}>
                <Table.Cell column="id" {root}>{id}</Table.Cell>
            </Table.Row.Base>
        {/each}
    {/snippet}
</MultiSelectionTable>
