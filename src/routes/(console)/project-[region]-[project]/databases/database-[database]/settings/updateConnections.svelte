<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Box, CardGrid, Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText, InputSelect } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';

    let {
        database
    }: {
        database: Models.DedicatedDatabase;
    } = $props();

    type ConnectionRole = 'readonly' | 'readwrite';

    const roleOptions: { value: ConnectionRole; label: string }[] = [
        { value: 'readwrite', label: 'Read / Write' },
        { value: 'readonly', label: 'Read only' }
    ];

    let connections: Models.DedicatedDatabaseConnection[] = $state([]);
    let isLoading = $state(true);

    let username: string = $state('');
    let role: ConnectionRole = $state('readwrite');
    let isCreating = $state(false);

    let showDeleteConfirm = $state(false);
    let connectionToDelete: Models.DedicatedDatabaseConnection | null = $state(null);
    let isDeleting = $state(false);

    onMount(async () => {
        try {
            const result = await sdk
                .forProject(page.params.region, page.params.project)
                .compute.listDatabaseConnections({ databaseId: database.$id });

            connections = result.connections;
        } catch {
            connections = [];
        } finally {
            isLoading = false;
        }
    });

    async function createConnection() {
        if (!username) return;
        isCreating = true;
        try {
            const connection = await sdk
                .forProject(page.params.region, page.params.project)
                .compute.createDatabaseConnection({ databaseId: database.$id, username, role });

            connections = [...connections, connection];
            username = '';
            role = 'readwrite';

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: `Database user "${connection.username}" has been created`,
                type: 'success'
            });

            trackEvent(Submit.DatabaseCreateConnection);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseCreateConnection);
        } finally {
            isCreating = false;
        }
    }

    async function deleteConnection() {
        if (!connectionToDelete) return;
        isDeleting = true;
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .compute.deleteDatabaseConnection({ databaseId: database.$id, connectionId: connectionToDelete.$id });

            connections = connections.filter((c) => c.$id !== connectionToDelete.$id);
            showDeleteConfirm = false;
            connectionToDelete = null;

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Database user has been deleted',
                type: 'success'
            });

            trackEvent(Submit.DatabaseDeleteConnection);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseDeleteConnection);
        } finally {
            isDeleting = false;
        }
    }

    function getRoleLabel(r: string): string {
        return r === 'readwrite' ? 'Read / Write' : 'Read only';
    }
</script>

{#if !isLoading}
    <Form onSubmit={createConnection}>
        <CardGrid>
            <svelte:fragment slot="title">Database users</svelte:fragment>
            Create and manage database users with specific roles. Each user receives unique credentials
            for connecting to the database.
            <svelte:fragment slot="aside">
                <ul>
                    {#if connections.length > 0}
                        <li class="u-margin-block-end-16">
                            <label class="label u-margin-block-end-8">Existing users</label>
                            <Layout.Stack direction="column" gap="s">
                                {#each connections as connection}
                                    <Box>
                                        <Layout.Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center">
                                            <Layout.Stack direction="column" gap="xxs">
                                                <h6 class="u-bold u-trim-1">
                                                    {connection.username}
                                                </h6>
                                                <Layout.Stack direction="row" gap="s">
                                                    <Typography.Caption
                                                        variant="400"
                                                        color="--fgcolor-neutral-tertiary">
                                                        {connection.database}
                                                    </Typography.Caption>
                                                    <Badge
                                                        variant="secondary"
                                                        content={getRoleLabel(connection.role)} />
                                                </Layout.Stack>
                                                <Typography.Caption
                                                    variant="400"
                                                    color="--fgcolor-neutral-tertiary">
                                                    Created: {toLocaleDateTime(
                                                        connection.$createdAt
                                                    )}
                                                </Typography.Caption>
                                            </Layout.Stack>
                                            <Button
                                                text
                                                icon
                                                ariaLabel="Delete user {connection.username}"
                                                on:click={() => {
                                                    connectionToDelete = connection;
                                                    showDeleteConfirm = true;
                                                }}>
                                                <span class="icon-trash" aria-hidden="true"></span>
                                            </Button>
                                        </Layout.Stack>
                                    </Box>
                                {/each}
                            </Layout.Stack>
                        </li>
                    {:else}
                        <li class="u-margin-block-end-16">
                            <p class="text">No additional database users created.</p>
                        </li>
                    {/if}

                    <InputText
                        id="connectionUsername"
                        label="Username"
                        placeholder="Enter username"
                        autocomplete={false}
                        bind:value={username}
                        required />
                    <InputSelect
                        id="connectionRole"
                        label="Role"
                        bind:value={role}
                        options={roleOptions} />
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={!username || isCreating} submit>
                    {isCreating ? 'Creating...' : 'Create user'}
                </Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Modal
        title="Delete database user"
        bind:show={showDeleteConfirm}
        onSubmit={deleteConnection}>
        <p class="text">
            Are you sure you want to delete the database user
            <b>{connectionToDelete?.username}</b>? Any active connections using this user will be
            terminated.
        </p>
        <svelte:fragment slot="footer">
            <Button
                text
                on:click={() => {
                    showDeleteConfirm = false;
                    connectionToDelete = null;
                }}>Cancel</Button>
            <Button danger submit disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
        </svelte:fragment>
    </Modal>
{/if}
