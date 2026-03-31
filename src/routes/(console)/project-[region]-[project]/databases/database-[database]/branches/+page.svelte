<script lang="ts">
    import { page } from '$app/state';
    import { CardGrid, Confirm } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { trackEvent } from '$lib/actions/analytics';
    import { ID, type Models } from '@appwrite.io/console';
    import {
        ActionMenu,
        Alert,
        Icon,
        Layout,
        Popover,
        Skeleton,
        Table,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { IconDotsHorizontal, IconRefresh, IconTrash } from '@appwrite.io/pink-icons-svelte';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();

    const database = $derived(data.dedicatedDatabase as Models.DedicatedDatabase);

    const computeSdk = $derived(sdk.forProject(page.params.region, page.params.project).compute);

    let branches = $state<Models.DedicatedDatabaseBranchList>({ total: 0, branches: [] });
    let isLoading = $state(true);
    let isCreating = $state(false);

    let showDeleteConfirm = $state(false);
    let selectedBranch = $state<Models.DedicatedDatabaseBranch | null>(null);

    const branchColumns = [
        { id: 'name', width: { min: 160 } },
        { id: 'branchId', width: { min: 160 } },
        { id: 'namespace', width: { min: 160 } },
        { id: 'expires', width: { min: 160 } },
        { id: 'actions', width: 64 }
    ];

    async function loadBranches() {
        if (!database) return;
        isLoading = true;
        try {
            branches = await computeSdk.listDatabaseBranches({ databaseId: database.$id });
        } catch (error) {
            addNotification({
                type: 'error',
                message: `Failed to load branches: ${error.message}`
            });
        } finally {
            isLoading = false;
        }
    }

    async function handleCreateBranch() {
        if (!database) return;
        isCreating = true;
        try {
            await computeSdk.createDatabaseBranch({
                databaseId: database.$id,
                branchId: ID.unique()
            });
            addNotification({
                type: 'success',
                message: 'Branch created'
            });
            trackEvent('submit_dedicated_branch_create');
            await loadBranches();
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackEvent('submit_dedicated_branch_create_error');
        } finally {
            isCreating = false;
        }
    }

    async function handleDeleteBranch() {
        if (!selectedBranch) return;
        try {
            await computeSdk.deleteDatabaseBranch({
                databaseId: database.$id,
                branchId: selectedBranch.branchId
            });
            addNotification({
                type: 'success',
                message: 'Branch deleted'
            });
            trackEvent('submit_dedicated_branch_delete');
            showDeleteConfirm = false;
            selectedBranch = null;
            await loadBranches();
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackEvent('submit_dedicated_branch_delete_error');
        }
    }

    function formatExpiration(timestamp: number): string {
        if (!timestamp) return '-';
        return toLocaleDateTime(new Date(timestamp * 1000).toISOString());
    }

    $effect(() => {
        if (database) {
            loadBranches();
        }
    });
</script>

{#if !database}
    <Container>
        <Alert.Inline status="warning" title="Not available">
            Branches are only available for dedicated databases.
        </Alert.Inline>
    </Container>
{:else}
    <Container>
        <CardGrid>
            <svelte:fragment slot="title">Database Branches</svelte:fragment>
            Ephemeral copies of your database for testing schema migrations or running experiments without
            affecting production data. Branches expire automatically after the configured TTL.
            <svelte:fragment slot="aside">
                <Layout.Stack gap="l">
                    {#if isLoading}
                        <Layout.Stack gap="s">
                            {#each Array(3) as _}
                                <Skeleton variant="line" width="100%" height={40} />
                            {/each}
                        </Layout.Stack>
                    {:else if branches.branches.length === 0}
                        <article class="empty card u-width-full-line">
                            No branches yet. Create one to start testing.
                        </article>
                    {:else}
                        <Table.Root columns={branchColumns} let:root>
                            <svelte:fragment slot="header" let:root>
                                <Table.Header.Cell column="name" {root}>Name</Table.Header.Cell>
                                <Table.Header.Cell column="branchId" {root}>ID</Table.Header.Cell>
                                <Table.Header.Cell column="namespace" {root}
                                    >Namespace</Table.Header.Cell>
                                <Table.Header.Cell column="expires" {root}
                                    >Expires</Table.Header.Cell>
                                <Table.Header.Cell column="actions" {root}></Table.Header.Cell>
                            </svelte:fragment>
                            {#each branches.branches as branch}
                                <Table.Row.Base id={branch.branchId} {root}>
                                    <Table.Cell column="name" {root}>
                                        <Typography.Text variant="m-500">
                                            {branch.branchName || branch.branchId}
                                        </Typography.Text>
                                    </Table.Cell>
                                    <Table.Cell column="branchId" {root}>
                                        <span class="branch-id">
                                            {branch.branchId}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell column="namespace" {root}>
                                        <span class="branch-id">
                                            {branch.namespace}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell column="expires" {root}>
                                        {formatExpiration(branch.expiresAt)}
                                    </Table.Cell>
                                    <Table.Cell column="actions" {root}>
                                        <Popover let:toggle padding="m" placement="bottom-end">
                                            <Button extraCompact on:click={toggle}>
                                                <Icon icon={IconDotsHorizontal} />
                                            </Button>
                                            <svelte:fragment slot="tooltip" let:toggle>
                                                <ActionMenu.Root width="180px" noPadding>
                                                    <ActionMenu.Item.Button
                                                        status="danger"
                                                        trailingIcon={IconTrash}
                                                        on:click={(e) => {
                                                            toggle(e);
                                                            selectedBranch = branch;
                                                            showDeleteConfirm = true;
                                                        }}>
                                                        Delete
                                                    </ActionMenu.Item.Button>
                                                </ActionMenu.Root>
                                            </svelte:fragment>
                                        </Popover>
                                    </Table.Cell>
                                </Table.Row.Base>
                            {/each}
                        </Table.Root>
                    {/if}
                </Layout.Stack>
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Layout.Stack direction="row" gap="s">
                    <Button secondary on:click={loadBranches}>
                        <Icon icon={IconRefresh} size="s" slot="start" />
                        Refresh
                    </Button>
                    <Button secondary disabled={isCreating} on:click={handleCreateBranch}>
                        {isCreating ? 'Creating...' : 'Create Branch'}
                    </Button>
                </Layout.Stack>
            </svelte:fragment>
        </CardGrid>
    </Container>
{/if}

<Confirm title="Delete branch" bind:open={showDeleteConfirm} onSubmit={handleDeleteBranch}>
    <Typography.Text>
        Are you sure you want to delete this branch? This removes the branch namespace, its storage,
        and the associated snapshot. This action is irreversible.
    </Typography.Text>
</Confirm>

<style>
    .empty {
        block-size: 200px;
        text-align: center;
        align-content: center;
    }

    .branch-id {
        font-family: var(--font-family-code, monospace);
        font-size: var(--font-size-xs);
        word-break: break-all;
    }
</style>
