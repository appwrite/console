<script lang="ts" context="module">
    export let showCreateUser = writable(false);
</script>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
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
    import type { PageData } from './$types';
    import Create from './createUser.svelte';
    import { Badge, Icon, Table, Layout } from '@appwrite.io/pink-svelte';
    import { Tag } from '@appwrite.io/pink-svelte';
    import { IconDuplicate, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { canWriteUsers } from '$lib/stores/roles';
    import type { Column } from '$lib/helpers/types';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { View } from '$lib/helpers/load';

    export let data: PageData;

    const projectId = $page.params.project;
    const columns = writable<Column[]>([
        { id: '$id', title: 'User ID', type: 'string', show: true, width: 140 },
        { id: 'name', title: 'Name', type: 'string', show: true, width: 260 },
        { id: 'identifiers', title: 'Identifiers', type: 'string', show: true, width: 140 },
        { id: 'status', title: 'Status', type: 'string', show: true, width: 140 },
        { id: 'labels', title: 'Labels', type: 'string', show: false, width: 140 },
        { id: 'joined', title: 'Joined', type: 'string', show: true, width: 140 },
        { id: 'lastActivity', title: 'Last activity', type: 'string', show: false, width: 140 }
    ]);

    async function userCreated(event: CustomEvent<Models.User<Record<string, unknown>>>) {
        await goto(`${base}/project-${projectId}/auth/user-${event.detail.$id}`);
    }
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery search={data.search} placeholder="Search by name, email, phone, or ID" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ViewSelector view={View.Table} {columns} hideView allowNoColumns />
            <Button on:mousedown={() => ($showCreateUser = true)} event="create_user" size="s">
                <Icon size="s" icon={IconPlus} slot="start" />
                <span class="text">Create user</span>
            </Button>
        </Layout.Stack>
    </Layout.Stack>

    {#if data.users.total}
        <Table.Root>
            <svelte:fragment slot="header">
                {#each $columns as column (column.id)}
                    {#if column.show}
                        <Table.Header.Cell>{column.title}</Table.Header.Cell>
                    {/if}
                {/each}
            </svelte:fragment>
            {#each data.users.users as user}
                <Table.Link href={`${base}/project-${projectId}/auth/user-${user.$id}`}>
                    {#each $columns as column (column.id)}
                        {#if column.show}
                            {#if column.id === '$id'}
                                <Table.Cell width={column.width + 'px'}>
                                    <Copy value={user.$id} event="user">
                                        <Tag size="xs" variant="code">
                                            <Icon size="s" icon={IconDuplicate} />
                                            {user.$id}
                                        </Tag>
                                    </Copy>
                                </Table.Cell>
                            {:else if column.id === 'name'}
                                <Table.Cell>
                                    <Layout.Stack direction="row" alignItems="center" gap="s">
                                        {#if user.email || user.phone}
                                            {#if user.name}
                                                <AvatarInitials size="xs" name={user.name} />
                                                <span>
                                                    {user.name}
                                                </span>
                                            {:else}
                                                <div class="avatar is-size-small">
                                                    <span
                                                        class="icon-minus-sm"
                                                        aria-hidden="true" />
                                                </div>
                                            {/if}
                                        {:else}
                                            <div class="avatar is-size-small">
                                                <span class="icon-anonymous" aria-hidden="true" />
                                            </div>
                                            <span class="text u-trim">{user.name}</span>
                                        {/if}
                                    </Layout.Stack>
                                </Table.Cell>
                            {:else if column.id === 'identifiers'}
                                <Table.Cell>
                                    {user.email && user.phone
                                        ? [user.email, user.phone].join(',')
                                        : user.email || user.phone}
                                </Table.Cell>
                            {:else if column.id === 'status'}
                                <Table.Cell>
                                    {#if user.status}
                                        {@const success =
                                            user.emailVerification || user.phoneVerification}
                                        <Badge
                                            size="xs"
                                            variant="secondary"
                                            type={success ? 'success' : undefined}
                                            content={user.emailVerification &&
                                            user.phoneVerification
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
                                </Table.Cell>
                            {:else if column.id === 'labels'}
                                <Table.Cell>
                                    {user.labels.join(', ')}
                                </Table.Cell>
                            {:else if column.id === 'joined'}
                                <Table.Cell>
                                    {toLocaleDateTime(user.registration)}
                                </Table.Cell>
                            {:else if column.id === 'lastActivity'}
                                <Table.Cell>
                                    {user.accessedAt ? toLocaleDate(user.accessedAt) : 'never'}
                                </Table.Cell>
                            {:else}
                                <Table.Cell width={column.width + 'px'}>
                                    {user[column.id]}
                                </Table.Cell>
                            {/if}
                        {/if}
                    {/each}
                    <!-- <Table.Cell>
                        <Layout.Stack direction="row" alignItems="center" gap="s">
                            {#if user.email || user.phone}
                                {#if user.name}
                                    <AvatarInitials size="xs" name={user.name} />
                                    <span class="text u-trim">{user.name}</span>
                                {:else}
                                    <div class="avatar is-size-small">
                                        <span class="icon-minus-sm" aria-hidden="true" />
                                    </div>
                                {/if}
                            {:else}
                                <div class="avatar is-size-small">
                                    <span class="icon-anonymous" aria-hidden="true" />
                                </div>
                                <span class="text u-trim">{user.name}</span>
                            {/if}
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell>
                        {user.email && user.phone
                            ? [user.email, user.phone].join(',')
                            : user.email || user.phone}
                    </Table.Cell>
                    <Table.Cell>
                        {#if user.status}
                            {@const success = user.emailVerification || user.phoneVerification}
                            <Badge
                                size="xs"
                                variant="secondary"
                                type={success ? 'success' : undefined}
                                content={user.emailVerification && user.phoneVerification
                                    ? 'verified'
                                    : user.emailVerification
                                      ? 'verified email'
                                      : user.phoneVerification
                                        ? 'verified phone'
                                        : 'unverified'} />
                        {:else}
                            <Badge size="xs" variant="secondary" type="error" content="blocked" />
                        {/if}
                    </Table.Cell>
                    <Table.Cell>
                        <Copy value={user.$id} event="user">
                            <Tag size="xs" variant="code">
                                <Icon size="s" icon={IconDuplicate} />
                                {user.$id}
                            </Tag>
                        </Copy>
                    </Table.Cell>
                    <Table.Cell>
                        {user.labels.join(', ')}
                    </Table.Cell>
                    <Table.Cell>
                        {toLocaleDateTime(user.registration)}
                    </Table.Cell>
                    <Table.Cell>
                        {user.accessedAt ? toLocaleDate(user.accessedAt) : 'never'}
                    </Table.Cell> -->
                </Table.Link>
            {/each}
        </Table.Root>

        <PaginationWithLimit
            name="Users"
            limit={data.limit}
            offset={data.offset}
            total={data.users.total} />
    {:else if data.search}
        <EmptySearch target="users" hidePagination>
            <Button href={`${base}/project-${projectId}/auth`} size="s" secondary
                >Clear Search</Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/references/cloud/server-nodejs/users"
            target="user"
            allowCreate={$canWriteUsers}
            on:mousedown={() => showCreateUser.set(true)} />
    {/if}
</Container>

<Create bind:showCreate={$showCreateUser} on:created={userCreated} />
