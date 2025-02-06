<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Id } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { Table } from '@appwrite.io/pink-svelte';

    export let data: PageData;
    const projectId = $page.params.project;
</script>

<Table.Root>
    <svelte:fragment slot="header">
        {#each $columns as column}
            {#if column.show}
                <Table.Header.Cell width={column.width + 'px'}>{column.title}</Table.Header.Cell>
            {/if}
        {/each}
    </svelte:fragment>
    {#each data.buckets.buckets as bucket (bucket.$id)}
        <Table.Link href={`${base}/project-${projectId}/storage/bucket-${bucket.$id}`}>
            {#each $columns as column}
                {#if column.show}
                    {#if column.id === '$id'}
                        {#key $columns}
                            <Table.Cell width={column.width + 'px'}>
                                <Id value={bucket.$id}>
                                    {bucket.$id}
                                </Id>
                            </Table.Cell>
                        {/key}
                    {:else if column.id === 'name'}
                        <Table.Cell width={column.width + 'px'}>
                            {bucket.name}
                        </Table.Cell>
                    {:else}
                        <Table.Cell width={column.width + 'px'}>
                            {toLocaleDateTime(bucket[column.id])}
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
        </Table.Link>
    {/each}
</Table.Root>
