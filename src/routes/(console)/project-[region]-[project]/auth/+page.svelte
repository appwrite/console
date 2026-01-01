<script lang="ts" module>
    export let showCreateUser = writable(false);
</script>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import {
        AvatarInitials,
        Copy,
        type DeleteOperationState,
        Empty,
        EmptySearch,
        MultiSelectionTable,
        PaginationWithLimit,
        SearchQuery
    } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { Container } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import Create from './createUser.svelte';
    import { Badge, Icon, Table, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Tag } from '@appwrite.io/pink-svelte';
    import { IconDuplicate, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { canWriteUsers } from '$lib/stores/roles';
    import type { Column } from '$lib/helpers/types';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { View } from '$lib/helpers/load';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';

    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

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

    async function userCreated(event: CustomEvent<Models.User<Record<string, unknown>>>) {
        await goto(
            `${base}/project-${page.params.region}-${page.params.project}/auth/user-${event.detail.$id}`
        );
    }

    async function handleDelete(selectedRows: string[]): Promise<DeleteOperationState> {
        const promises = selectedRows.map((userId) => {
            return sdk.forProject(page.params.region, page.params.project).users.delete({ userId });
        });

        try {
            await Promise.all(promises);
            trackEvent(Submit.UserDelete, { total: selectedRows.length });
        } catch (error) {
            trackError(error, Submit.UserDelete);
            return error;
        } finally {
            await invalidate(Dependencies.USERS);
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
        <MultiSelectionTable
            resource="user"
            columns={$columns}
            onDelete={handleDelete}
            allowSelection={$canWriteUsers}>
            {#snippet header(root)}
                {#each $columns as { id, title } (id)}
                    <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
                {/each}
            {/snippet}

            {#snippet children(root)}
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
                                                <span class="icon-anonymous" aria-hidden="true"
                                                ></span>
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
                                {:else if id === 'labels'}
                                    <Typography.Text truncate>
                                        {user.labels.join(', ')}
                                    </Typography.Text>
                                {:else if id === 'joined'}
                                    <DualTimeView time={user.registration} />
                                {:else if id === 'lastActivity'}
                                    {#if user.accessedAt}
                                        <DualTimeView time={user.accessedAt} />
                                    {:else}
                                        never
                                    {/if}
                                {:else}
                                    {user[id]}
                                {/if}
                            </Table.Cell>
                        {/each}
                    </Table.Row.Link>
                {/each}
            {/snippet}

            {#snippet deleteContentNotice()}
                This action is irreversible and will permanently remove the selected users and all
                their data.
            {/snippet}
        </MultiSelectionTable>

        <PaginationWithLimit
            name="Users"
            limit={data.limit}
            offset={data.offset}
            total={data.users.total} />
    {:else if data.search}
        <EmptySearch target="users" hidePagination>
            <Button
                size="s"
                secondary
                href={`${base}/project-${page.params.region}-${page.params.project}/auth`}
                >Clear Search</Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/references/cloud/server-nodejs/users"
            target="user"
            allowCreate={$canWriteUsers}
            on:click={() => showCreateUser.set(true)} />
    {/if}
</Container>

<Create bind:showCreate={$showCreateUser} on:created={userCreated} />
