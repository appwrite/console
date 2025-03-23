<script lang="ts">
    import { Empty } from '$lib/components';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { canWriteKeys } from '$lib/stores/roles';
    import type { PageData } from './$types';
    import Action from './action.svelte';
    import { setOverviewAction } from '../context';
    import { Table } from '@appwrite.io/pink-svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    export let data: PageData;

    setOverviewAction(Action);
</script>

{#if data.devKeys.total}
    <Table.Root columns={4} let:root>
        <svelte:fragment slot="header" let:root>
            <Table.Header.Cell {root}>Name</Table.Header.Cell>
            <Table.Header.Cell {root}>Last accessed</Table.Header.Cell>
            <Table.Header.Cell {root}>Expiration date</Table.Header.Cell>
        </svelte:fragment>
        {#each data.devKeys.keys as key}
            <Table.Row.Link href={`dev-keys/${key.$id}`} {root}>
                <Table.Cell {root}>
                    {key.name}
                </Table.Cell>
                <Table.Cell {root}>
                    {key.accessedAt ? toLocaleDate(key.accessedAt) : 'never'}
                </Table.Cell>
                <Table.Cell {root}>
                    {key.expire ? toLocaleDateTime(key.expire) : 'never'}
                </Table.Cell>
            </Table.Row.Link>
        {/each}
    </Table.Root>
{:else}
    <Empty
        single
        allowCreate={$canWriteKeys}
        href="https://appwrite.io/docs/advanced/platform/dev-keys"
        target="Dev key"
        on:click={() => goto(`${base}/project-${$page.params.project}/overview/dev-keys/create`)} />
{/if}
