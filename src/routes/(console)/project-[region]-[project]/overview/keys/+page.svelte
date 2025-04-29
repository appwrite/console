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
    import { page } from '$app/state';

    export let data: PageData;

    setOverviewAction(Action);
</script>

{#if data.keys.total}
    <Table.Root columns={4} let:root>
        <svelte:fragment slot="header" let:root>
            <Table.Header.Cell {root}>Name</Table.Header.Cell>
            <Table.Header.Cell {root}>Last accessed</Table.Header.Cell>
            <Table.Header.Cell {root}>Expiration date</Table.Header.Cell>
            <Table.Header.Cell {root}>Scopes</Table.Header.Cell>
        </svelte:fragment>
        {#each data.keys.keys as key}
            <Table.Row.Link href={`keys/${key.$id}`} {root}>
                <Table.Cell {root}>
                    {key.name}
                </Table.Cell>
                <Table.Cell {root}>
                    {key.accessedAt ? toLocaleDate(key.accessedAt) : 'never'}
                </Table.Cell>
                <Table.Cell {root}>
                    {key.expire ? toLocaleDateTime(key.expire) : 'never'}
                </Table.Cell>
                <Table.Cell {root}>
                    {key.scopes.length} Scopes
                </Table.Cell>
            </Table.Row.Link>
        {/each}
    </Table.Root>
{:else}
    <Empty
        single
        allowCreate={$canWriteKeys}
        href="https://appwrite.io/docs/advanced/platform/api-keys"
        target="API key"
        on:click={() => goto(`${base}/project-${page.params.project}/overview/keys/create`)} />
{/if}
