<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { Empty, MultiSelectionTable } from '$lib/components';
    import { canWriteKeys, canWriteTeams, canWriteProjects } from '$lib/stores/roles';
    import type { Models } from '@appwrite.io/console';
    import { diffDays } from '$lib/helpers/date';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import {
        devKeyColumns,
        keyColumns,
        showDevKeysCreateModal,
        organizationKeyColumns,
        accountKeyColumns
    } from '../store';
    import { Badge, Icon, Layout, Table } from '@appwrite.io/pink-svelte';
    import DeleteBatch from './deleteBatch.svelte';
    import { capitalize } from '$lib/helpers/string';
    import { getEffectiveScopes } from '../api-keys/scopes.svelte';
    import type { Column } from '$lib/helpers/types';
    import { Button } from '$lib/elements/forms';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    let {
        keyType = 'api',
        keys,
        showCreateButton = false
    }: {
        keyType?: 'api' | 'dev' | 'organization' | 'account';
        keys: Models.KeyList | Models.DevKeyList;
        showCreateButton?: boolean;
    } = $props();

    let selectedKeys = $state([]);
    let showDeleteModal = $state(false);

    function canWrite() {
        switch (keyType) {
            case 'api':
                return $canWriteKeys;
            case 'dev':
                return $canWriteProjects;
            case 'organization':
                return $canWriteTeams;
            case 'account':
                return true;
        }
    }

    function getLabel(): string {
        switch (keyType) {
            case 'api':
                return 'API key';
            case 'dev':
                return 'dev key';
            case 'organization':
                return 'organization key';
            case 'account':
                return 'account token';
        }
    }

    function getSlug(): string {
        switch (keyType) {
            case 'api':
                return 'api-keys';
            case 'dev':
                return 'dev-keys';
            case 'organization':
                return 'integrations/keys';
            case 'account':
                return 'integrations/tokens';
        }
    }

    function getColumns(): Column[] {
        switch (keyType) {
            case 'api':
                return $keyColumns;
            case 'dev':
                return $devKeyColumns;
            case 'organization':
                return $organizationKeyColumns;
            case 'account':
                return $accountKeyColumns;
        }
    }

    function getExpiredColor(): 'error' | 'warning' {
        switch (keyType) {
            case 'api':
            case 'organization':
            case 'account':
                return 'error';
            case 'dev':
                return 'warning';
        }
    }

    const label = getLabel();
    const slug = getSlug();
    const columns = getColumns();

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
            status: isExpired ? getExpiredColor() : isExpiring ? 'warning' : null
        };
    }

    function getKeys(): Models.Key[] | Models.DevKey[] {
        switch (keyType) {
            case 'api':
            case 'organization':
            case 'account':
                return keys['keys'] as Models.Key[];
            case 'dev':
                return keys['devKeys'] as Models.DevKey[];
        }
    }

    function getDescription(): string {
        switch (keyType) {
            case 'api':
                return 'Use API keys to authenticate your app’s requests in production, granting secure access to live data and services.';
            case 'organization':
                return "Use organization keys to manage projects in your organization and organization's settings.";
            case 'account':
                return 'Use account tokens to manage your organizations and your account settings.';
            case 'dev':
                return 'Dev keys allow bypassing rate limits and CORS errors in your development environment.';
        }
    }

    function hasScopes(): boolean {
        switch (keyType) {
            case 'api':
            case 'organization':
            case 'account':
                return true;
            case 'dev':
                return false;
        }
    }

    async function onKeyCreate() {
        switch (keyType) {
            case 'api':
                await goto(
                    `${base}/project-${page.params.region}-${page.params.project}/overview/${slug}/create`
                );
                break;
            case 'organization':
                await goto(
                    `${base}/organization-${page.params.organization}/integrations/create-key`
                );
                break;
            case 'account':
                await goto(`${base}/account/integrations/create-token`);
                break;
            case 'dev':
                $showDevKeysCreateModal = true;
                break;
        }
    }
</script>

{#if keys.total}
    <MultiSelectionTable
        {columns}
        confirmDeletion={false}
        allowSelection={canWrite()}
        showSuccessNotification={false}
        resource={capitalize(label)}
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
                    {#if hasScopes()}
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
        allowCreate={canWrite()}
        href="https://appwrite.io/docs/advanced/platform/{slug}"
        target={label}
        description={getDescription()}
        on:click={onKeyCreate} />
{/if}

<DeleteBatch {keyType} bind:keyIds={selectedKeys} bind:showDelete={showDeleteModal} />

{#if showCreateButton && keys.total}
    <div>
        <Button compact on:click={onKeyCreate}>
            <Icon icon={IconPlus} slot="start" size="s" />
            Create {getLabel()}
        </Button>
    </div>
{/if}
