<script lang="ts">
    import { Empty } from '$lib/components';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { canWriteKeys } from '$lib/stores/roles';
    import { Table } from '@appwrite.io/pink-svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import type { Models } from '@appwrite.io/console';

    export let keyType: 'api' | 'dev' = 'api';
    export let keys: Models.KeyList | Models.DevKeyList;

    const isApiKey = keyType === 'api';
    const label = isApiKey ? 'API' : 'Dev';
    const slug = isApiKey ? 'keys' : 'dev-keys';

    function asApiKey(key: Models.Key | Models.DevKey) {
        return key as Models.Key;
    }
</script>

{#if keys.total}
    <Table.Root columns={4} let:root>
        <svelte:fragment slot="header" let:root>
            <Table.Header.Cell {root}>Name</Table.Header.Cell>
            <Table.Header.Cell {root}>Last accessed</Table.Header.Cell>
            <Table.Header.Cell {root}>Expiration date</Table.Header.Cell>
            {#if isApiKey}
                <Table.Header.Cell {root}>Scopes</Table.Header.Cell>
            {/if}
        </svelte:fragment>
        {#each keys.keys as key}
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
                {#if isApiKey}
                    <Table.Cell {root}>
                        {asApiKey(key).scopes.length} Scopes
                    </Table.Cell>
                {/if}
            </Table.Row.Link>
        {/each}
    </Table.Root>
{:else}
    <Empty
        single
        allowCreate={$canWriteKeys}
        href="https://appwrite.io/docs/advanced/platform/{slug}"
        target="{label} key"
        on:click={() => goto(`${base}/project-${$page.params.project}/overview/${slug}/create`)} />
{/if}
