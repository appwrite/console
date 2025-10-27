<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { Empty, MultiSelectionTable } from '$lib/components';
    import { canWriteKeys } from '$lib/stores/roles';
    import type { Models } from '@appwrite.io/console';
    import { diffDays } from '$lib/helpers/date';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { devKeyColumns, keyColumns, showDevKeysCreateModal } from '../store';
    import { Badge, Layout, Table } from '@appwrite.io/pink-svelte';
    import DeleteBatch from './deleteBatch.svelte';
    import { capitalize } from '$lib/helpers/string';
    import { getEffectiveScopes } from '../api-keys/scopes.svelte';

    let {
        keyType = 'api',
        keys
    }: {
        keyType?: 'api' | 'dev';
        keys: Models.KeyList | Models.DevKeyList;
    } = $props();

    let selectedKeys = $state([]);
    let showDeleteModal = $state(false);

    const isApiKey = keyType === 'api';
    const label = isApiKey ? 'API' : 'dev';
    const slug = isApiKey ? 'api-keys' : 'dev-keys';
    const columns = isApiKey ? $keyColumns : $devKeyColumns;

    function getApiKeyScopeCount(key: Models.Key | Models.DevKey) {
        const apiKey = key as Models.Key;
        return getEffectiveScopes(apiKey.scopes).length;
    }

    function getExpiryDetails(key: Models.Key | Models.DevKey): {
        status: 'success' | 'warning' | 'error' | null;
        message: string | null;
    } {
        const isExpired = key.expire !== null && new Date(key.expire) < new Date();
        const isExpiring = key.expire && diffDays(new Date(), new Date(key.expire)) < 14;

        return {
            message: isExpired ? 'Expired' : isExpiring ? 'Expires soon' : null,
            status: isExpired ? (isApiKey ? 'error' : 'warning') : isExpiring ? 'warning' : null
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
            return 'Dev keys allow bypassing rate limits and CORS errors in your development environment.';
    }
</script>

{#if keys.total}
    <MultiSelectionTable
        {columns}
        confirmDeletion={false}
        allowSelection={$canWriteKeys}
        showSuccessNotification={false}
        resource={`${capitalize(label)} key`}
        onDelete={(selectedRows) => {
            showDeleteModal = true;
            selectedKeys = selectedRows;
        }}>
        {#snippet header(root)}
            {#each columns as column}
                <Table.Header.Cell column={column.id} {root}>{column.title}</Table.Header.Cell>
            {/each}
        {/snippet}

        {#snippet children(root)}
            {#each getKeys() as key (key.$id)}
                <Table.Row.Link id={key.$id} href={`${slug}/${key.$id}`} {root}>
                    <Table.Cell {root}>
                        {key.name}
                    </Table.Cell>
                    <Table.Cell {root}>
                        {#if key.accessedAt}
                            <DualTimeView time={key.accessedAt} />
                        {:else}
                            never
                        {/if}
                    </Table.Cell>
                    <Table.Cell {root}>
                        {@const expiration = getExpiryDetails(key)}
                        <Layout.Stack gap="s" direction="row">
                            {#if key.expire}
                                <DualTimeView time={key.expire} />
                            {:else}
                                never
                            {/if}

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
                            {getApiKeyScopeCount(key)} Scopes
                        </Table.Cell>
                    {/if}
                </Table.Row.Link>
            {/each}
        {/snippet}
    </MultiSelectionTable>
{:else}
    <Empty
        single
        allowCreate={$canWriteKeys}
        href="https://appwrite.io/docs/advanced/platform/{slug}"
        target="{label} key"
        description={getDescription()}
        on:click={async () => {
            if (isApiKey) {
                await goto(
                    `${base}/project-${page.params.region}-${page.params.project}/overview/${slug}/create`
                );
            } else {
                $showDevKeysCreateModal = true;
            }
        }} />
{/if}

<DeleteBatch {keyType} bind:keyIds={selectedKeys} bind:showDelete={showDeleteModal} />
