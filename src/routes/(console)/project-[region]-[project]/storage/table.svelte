<script lang="ts">
    import { Id } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { Table } from '@appwrite.io/pink-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data: PageData;
</script>

<Table.Root columns={$columns} let:root>
    <svelte:fragment slot="header" let:root>
        {#each $columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each data.buckets.buckets as bucket (bucket.$id)}
        <Table.Row.Link {root} href={getProjectRoute(`/storage/bucket-${bucket.$id}`)}>
            {#each $columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === '$id'}
                        {#key $columns}
                            <Id value={bucket.$id}>
                                {bucket.$id}
                            </Id>
                        {/key}
                    {:else if column.id === 'name'}
                        {bucket.name}
                    {:else}
                        {toLocaleDateTime(bucket[column.id])}
                    {/if}
                </Table.Cell>
            {/each}
        </Table.Row.Link>
    {/each}
</Table.Root>
