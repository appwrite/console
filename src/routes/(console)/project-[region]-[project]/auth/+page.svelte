<script lang="ts" context="module">
    export let showCreateUser = writable(false);
</script>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import {
        AvatarInitials,
        Copy,
        Empty,
        EmptySearch,
        PaginationWithLimit,
        SearchQuery
    } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import Create from './createUser.svelte';
    import {
        Badge,
        Icon,
        Table,
        Layout,
        Typography,
        FloatingActionBar
    } from '@appwrite.io/pink-svelte';
    import { Tag } from '@appwrite.io/pink-svelte';
    import { IconDuplicate, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { canWriteUsers } from '$lib/stores/roles';
    import type { Column } from '$lib/helpers/types';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { View } from '$lib/helpers/load';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import Confirm from '$lib/components/confirm.svelte';

    export let data;

    const columns = writable<Column[]>([
        { id: '$id', title: 'User ID', type: 'string', width: 200 },
        { id: 'name', title: 'Name', type: 'string', width: { min: 260 } },
        { id: 'identifiers', title: 'Identifiers', type: 'string', width: { min: 260 } },
        { id: 'status', title: 'Status', type: 'string', width: { min: 140 } },
        { id: 'labels', title: 'Labels', type: 'string', hide: true, width: { min: 140 } },
        { id: 'joined', title: 'Joined', type: 'string', width: { min: 140 } },
        {
            id: 'lastActivity',
            title: 'Last activity',
            type: 'string',
            hide: true,
            width: { min: 140 }
        }
    ]);

    let selectedUsers: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function userCreated(event: CustomEvent<Models.User<Record<string, unknown>>>) {
        await goto(
            `${base}/project-${page.params.region}-${page.params.project}/auth/user-${event.detail.$id}`
        );
    }

    async function handleDelete() {
        showDelete = false;
        deleting = true;

        const promises = selectedUsers.map((userId) =>
            sdk.forProject(page.params.region, page.params.project).users.delete(userId)
        );

        try {
            await Promise.all(promises);
            trackEvent(Submit.UserDelete, {
                total: selectedUsers.length
            });
            addNotification({
                type: 'success',
                message: `${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.USERS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.UserDelete);
        } finally {
            selectedUsers = [];
            showDelete = false;
            deleting = false;
        }
    }
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery placeholder="Search by name, email, phone, or ID" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ViewSelector ui="new" view={View.Table} {columns} hideView />
            <Button on:click={() => ($showCreateUser = true)} event="create_user" size="s">
                <Icon size="s" icon={IconPlus} slot="start" />
                <span class="text">Create user</span>
            </Button>
        </Layout.Stack>
    </Layout.Stack>

    {#if data.users.total}
        <Table.Root
            columns={$columns}
            allowSelection={$canWriteUsers}
            bind:selectedRows={selectedUsers}
            let:root>
            <svelte:fragment slot="header" let:root>
                {#each $columns as { id, title } (id)}
                    <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
                {/each}
            </svelte:fragment>
            {#each data.users.users as user}
                <Table.Row.Link
                    href={`${base}/project-${page.params.region}-${page.params.project}/auth/user-${user.$id}`}
                    {root}
                    id={user.$id}>
                    {#each $columns as { id } (id)}
                        <Table.Cell column={id} {root}>
                            {#if id === '$id'}
                                <Copy value={user.$id} event="user">
                                    <Tag size="xs" variant="code">
                                        <Icon size="s" icon={IconDuplicate} slot="start" />
                                        {user.$id}
                                    </Tag>
                                </Copy>
                            {:else if id === 'name'}
                                <Layout.Stack direction="row" alignItems="center" gap="s">
                                    {#if user.email || user.phone}
                                        {#if user.name}
                                            <AvatarInitials size="xs" name={user.name} />
                                            <Typography.Text truncate>
                                                {user.name}
                                            </Typography.Text>
                                        {:else}
                                            <div class="avatar is-size-small">
                                                <span class="icon-minus-sm" aria-hidden="true"
                                                ></span>
                                            </div>
                                        {/if}
                                    {:else}
                                        <div class="avatar is-size-small">
                                            <span class="icon-anonymous" aria-hidden="true"></span>
                                        </div>
                                        <Typography.Text truncate>
                                            {user.name}
                                        </Typography.Text>
                                    {/if}
                                </Layout.Stack>
                            {:else if id === 'identifiers'}
                                <Typography.Text truncate>
                                    {user.email && user.phone
                                        ? [user.email, user.phone].join(',')
                                        : user.email || user.phone}
                                </Typography.Text>
                            {:else if id === 'status'}
                                {#if user.status}
                                    {@const success =
                                        user.emailVerification || user.phoneVerification}
                                    <Badge
                                        size="xs"
                                        variant="secondary"
                                        type={success ? 'success' : undefined}
                                        content={user.emailVerification && user.phoneVerification
                                            ? 'Verified'
                                            : user.emailVerification
                                              ? 'Verified email'
                                              : user.phoneVerification
                                                ? 'Verified phone'
                                                : 'Unverified'} />
                                {:else}
                                    <Badge
                                        size="xs"
                                        variant="secondary"
                                        type="error"
                                        content="blocked" />
                                {/if}
                            {:else if id === 'labels'}
                                <Typography.Text truncate>
                                    {user.labels.join(', ')}
                                </Typography.Text>
                            {:else if id === 'joined'}
                                {toLocaleDateTime(user.registration)}
                            {:else if id === 'lastActivity'}
                                {user.accessedAt ? toLocaleDate(user.accessedAt) : 'never'}
                            {:else}
                                {user[id]}
                            {/if}
                        </Table.Cell>
                    {/each}
                </Table.Row.Link>
            {/each}
        </Table.Root>

        <PaginationWithLimit
            name="Users"
            limit={data.limit}
            offset={data.offset}
            total={data.users.total} />
    {:else if data.search}
        <EmptySearch target="users" hidePagination>
            <Button
                href={`${base}/project-${page.params.region}-${page.params.project}/auth`}
                size="s"
                secondary>Clear Search</Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/references/cloud/server-nodejs/users"
            target="user"
            allowCreate={$canWriteUsers}
            on:click={() => showCreateUser.set(true)} />
    {/if}

    {#if selectedUsers.length > 0}
        <FloatingActionBar>
            <svelte:fragment slot="start">
                <Badge content={selectedUsers.length.toString()} />
                <span>
                    {selectedUsers.length > 1 ? 'users' : 'user'}
                    selected
                </span>
            </svelte:fragment>
            <svelte:fragment slot="end">
                <Button text on:click={() => (selectedUsers = [])}>Cancel</Button>
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </FloatingActionBar>
    {/if}
</Container>

<Create bind:showCreate={$showCreateUser} on:created={userCreated} />

<Confirm title="Delete users" bind:open={showDelete} onSubmit={handleDelete} disabled={deleting}>
    <Typography.Text>
        Are you sure you want to delete <b>{selectedUsers.length}</b>
        {selectedUsers.length > 1 ? 'users' : 'user'}?
    </Typography.Text>
    <Typography.Text>
        This action is irreversible and will permanently remove the selected users and all their
        data.
    </Typography.Text>
</Confirm>
