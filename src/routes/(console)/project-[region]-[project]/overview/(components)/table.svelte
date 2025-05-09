<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { Empty } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { canWriteKeys } from '$lib/stores/roles';
    import type { Models } from '@appwrite.io/console';
    import { diffDays, toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { devKeyColumns, keyColumns, showDevKeysCreateModal } from '../store';
    import { Badge, FloatingActionBar, Layout, Table } from '@appwrite.io/pink-svelte';
    import DeleteBatch from './deleteBatch.svelte';
    import { capitalize } from '$lib/helpers/string';

    export let keyType: 'api' | 'dev' = 'api';
    export let keys: Models.KeyList | Models.DevKeyList;

    let showDeleteModal = false;
    let selectedRows: string[] = [];

    const isApiKey = keyType === 'api';
    const label = isApiKey ? 'API' : 'dev';
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

    function getDescription(): string {
        if (isApiKey)
            return 'Use API keys to authenticate your app’s requests in production, granting secure access to live data and services.';
        else
            return 'Dev keys allow bypassing rate limits and accessing more detailed error messages while in development.';
    }

    const columns = isApiKey ? $keyColumns : $devKeyColumns;
</script>

{#if keys.total}
    <Table.Root let:root {columns} bind:selectedRows allowSelection={$canWriteKeys}>
        <svelte:fragment slot="header" let:root>
            {#each columns as column}
                <Table.Header.Cell column={column.id} {root}>{column.title}</Table.Header.Cell>
            {/each}
        </svelte:fragment>
        {#each getKeys() as key (key.$id)}
            <Table.Row.Link id={key.$id} href={`${slug}/${key.$id}`} {root}>
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
        description={getDescription()}
        on:click={() => {
            if (isApiKey) {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/overview/${slug}/create`
                );
            } else {
                $showDevKeysCreateModal = true;
            }
        }} />
{/if}

{#if selectedRows.length > 0}
    <FloatingActionBar>
        <svelte:fragment slot="start">
            <Badge content={selectedRows.length.toString()} />
            <span>
                {capitalize(label)}
                {selectedRows.length > 1 ? 'keys' : 'key'}
                selected
            </span>
        </svelte:fragment>
        <svelte:fragment slot="end">
            <Button text on:click={() => (selectedRows = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDeleteModal = true)}>Delete</Button>
        </svelte:fragment>
    </FloatingActionBar>
{/if}

<DeleteBatch {keyType} bind:keyIds={selectedRows} bind:showDelete={showDeleteModal} />
