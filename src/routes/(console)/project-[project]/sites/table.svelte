<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Icon, Table } from '@appwrite.io/pink-svelte';
    import { columns } from './store';
    import type { Models } from '@appwrite.io/console';

    export let siteList: Models.SiteList;
</script>

<Table.Root>
    <svelte:fragment slot="header">
        {#each $columns as column}
            {#if column.show}
                <Table.Header.Cell width={column?.width?.toString() ?? ''}>
                    {column.title}
                </Table.Header.Cell>
            {/if}
        {/each}
    </svelte:fragment>
    {#each siteList.sites as site}
        <Table.Link href={`${base}/project-${$page.params.project}/sites/site-${site.$id}`}>
            {#each $columns as column}
                {#if column.show}
                    {#if column.id === 'name'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            <Icon
                            {site.name}
                        </Table.Cell>
                    {:else if column.id === '$updatedAt'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            {toLocaleDateTime(site[column.id])}
                        </Table.Cell>
                    {:else if column.id === '$createdAt'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            {toLocaleDateTime(site[column.id])}
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
        </Table.Link>
    {/each}
</Table.Root>
