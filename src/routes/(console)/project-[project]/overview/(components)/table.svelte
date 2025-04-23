<script lang="ts">
    import { Empty } from '$lib/components';
    import { diffDays, toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { canWriteKeys } from '$lib/stores/roles';
    import { Badge, Layout, Table } from '@appwrite.io/pink-svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';

    export let keyType: 'api' | 'dev' = 'api';
    export let keys: Models.KeyList | Models.DevKeyList;

    const isApiKey = keyType === 'api';
    const label = isApiKey ? 'API' : 'Dev';
    const slug = isApiKey ? 'keys' : 'dev-keys';

    function asApiKey(key: Models.Key | Models.DevKey) {
        return key as Models.Key;
    }

    function getExpiryDetails(key: Models.Key | Models.DevKey): {
        status: 'success' | 'warning' | 'error' | null;
        message: string | null;
    } {
        const isExpired = key.expire !== null && new Date(key.expire) < new Date();
        const isExpiring = key.expire && diffDays(new Date(), new Date(key.expire)) < 14;

        return {
            status: isExpired ? 'error' : isExpiring ? 'warning' : null,
            message: isExpired ? 'Expired' : isExpiring ? 'Expires soon' : null
        };
    }

    function getKeys(): Models.Key[] | Models.DevKey[] {
        if (isApiKey) return keys['keys'] as Models.Key[];
        else return keys['devKeys'] as Models.DevKey[];
    }
</script>

{#if keys.total}
    <Table.Root columns={isApiKey ? 4 : 3} let:root>
        <svelte:fragment slot="header" let:root>
            <Table.Header.Cell {root}>Name</Table.Header.Cell>
            <Table.Header.Cell {root}>Last accessed</Table.Header.Cell>
            <Table.Header.Cell {root}>Expiration date</Table.Header.Cell>
            {#if isApiKey}
                <Table.Header.Cell {root}>Scopes</Table.Header.Cell>
            {/if}
        </svelte:fragment>
        {#each getKeys() as key (key.$id)}
            <Table.Row.Link href={`${slug}/${key.$id}`} {root}>
                <Table.Cell {root}>
                    {key.name}
                </Table.Cell>
                <Table.Cell {root}>
                    {key.accessedAt ? toLocaleDate(key.accessedAt) : 'never'}
                </Table.Cell>
                <Table.Cell {root}>
                    {@const expiration = getExpiryDetails(key)}
                    <Layout.Stack gap="s" direction="row">
                        {key.expire ? toLocaleDateTime(key.expire) : 'never'}

                        {#if expiration.status}
                            <Badge
                                size="s"
                                variant="secondary"
                                type={expiration.status}
                                content={expiration.message} />
                        {/if}
                    </Layout.Stack>
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
        on:click={() => goto(`${base}/project-${page.params.project}/overview/${slug}/create`)} />
{/if}
