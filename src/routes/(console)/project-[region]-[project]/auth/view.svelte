<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { AvatarInitials, Copy, Empty, EmptySearch, PaginationWithLimit, SearchQuery } from '$lib/components';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import type { Column } from '$lib/helpers/types';
    import { Container } from '$lib/layout';
    import { View } from '$lib/helpers/load';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { Button } from '$lib/elements/forms';
    import { Badge, Icon, Table, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Tag } from '@appwrite.io/pink-svelte';
    import { IconDuplicate, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { writable } from 'svelte/store';
    import CreateUser from './createUser.svelte';

    let {
        users,
        limit,
        offset,
        search,
        createUserUrl
    }: {
        users: { total: number; users: Models.User<{}>[] };
        limit: number;
        offset: number;
        search: string | null;
        createUserUrl: (user: Models.User<{}>) => string;
    } = $props();

    const clearSearchHref = page.url.pathname;

    let showCreateUser = $state(false);
    async function onUserCreated(e: CustomEvent<Models.User<{}>>) {
        await goto(createUserUrl(e.detail));
    }

    const columns = writable<Column[]>([
        { id: '$id', title: 'User ID', type: 'string', width: 200 },
        { id: 'name', title: 'Name', type: 'string', width: { min: 260 } },
        { id: 'identifiers', title: 'Identifiers', type: 'string', width: { min: 260 } },
        { id: 'status', title: 'Status', type: 'string', width: { min: 140 } },
        { id: 'labels', title: 'Labels', type: 'string', hide: true, width: { min: 140 } },
        { id: 'joined', title: 'Joined', type: 'string', width: { min: 140 } },
        { id: 'lastActivity', title: 'Last activity', type: 'string', hide: true, width: { min: 140 } }
    ]);
</script>

<Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery placeholder="Search by name, email, phone, or ID" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ViewSelector view={View.Table} {columns} hideView />
            <Button on:click={() => (showCreateUser = true)} event="create_user" size="s">
                <Icon size="s" icon={IconPlus} slot="start" />
                <span class="text">Create user</span>
            </Button>
        </Layout.Stack>
    </Layout.Stack>

    {#if users.total}
        <Table.Root columns={$columns} let:root>
            <svelte:fragment slot="header" let:root>
                {#each $columns as { id, title } (id)}
                    <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
                {/each}
            </svelte:fragment>

            {#each users.users as user}
                {@const href = createUserUrl(user)}
                {#if href}
                    <Table.Row.Link href={href} {root}>
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
                                                    <span class="icon-minus-sm" aria-hidden="true"></span>
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
                                        {@const success = user.emailVerification || user.phoneVerification}
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
                                        <Badge size="xs" variant="secondary" type="error" content="blocked" />
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
                {:else}
                    <Table.Row.Base {root}>
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
                                                    <span class="icon-minus-sm" aria-hidden="true"></span>
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
                                        {@const success = user.emailVerification || user.phoneVerification}
                                        <Badge size="xs" variant="secondary" type={success ? "success" : "warning"} content={success ? "verified" : "unverified"} />
                                    {:else}
                                        <Badge size="xs" variant="secondary" type="error" content="blocked" />
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
                    </Table.Row.Base>
                {/if}
            {/each}
        </Table.Root>

        <PaginationWithLimit name="Users" {limit} {offset} total={users.total} />
    {:else if search}
        <EmptySearch target="users" hidePagination>
            <Button href={clearSearchHref} size="s" secondary>Clear Search</Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/references/cloud/server-nodejs/users"
            target="user"
            allowCreate={true}
            on:click={() => (showCreateUser = true)} />
    {/if}

<CreateUser bind:showCreate={showCreateUser} on:created={onUserCreated} />
