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
    import { Container, ContainerHeader } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import type { PageData } from './$types';
    import Create from './createUser.svelte';
    import { tooltip } from '$lib/actions/tooltip';
    import { Badge, Icon, Table, Layout } from '@appwrite.io/pink-svelte';
    import { Tag } from '@appwrite.io/pink-svelte';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';

    export let data: PageData;

    const projectId = $page.params.project;
    async function userCreated(event: CustomEvent<Models.User<Record<string, unknown>>>) {
        await goto(`${base}/project-${projectId}/auth/user-${event.detail.$id}`);
    }
</script>

<Container>
    <ContainerHeader title="Users" isFlex={false} total={data.users.total} let:isButtonDisabled>
        <SearchQuery search={data.search} placeholder="Search by name, email, phone, or ID">
            <div
                use:tooltip={{
                    content: `Upgrade to add more users`,
                    disabled: !isButtonDisabled
                }}>
                <Button
                    on:mousedown={() => ($showCreateUser = true)}
                    event="create_user"
                    disabled={isButtonDisabled}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Create user</span>
                </Button>
            </div>
        </SearchQuery>
    </ContainerHeader>
    {#if data.users.total}
        <Table.Root>
            <svelte:fragment slot="header">
                <Table.Header.Cell>Name</Table.Header.Cell>
                <Table.Header.Cell>Identifiers</Table.Header.Cell>
                <Table.Header.Cell width="130px">Status</Table.Header.Cell>
                <Table.Header.Cell width="100px">ID</Table.Header.Cell>
                <Table.Header.Cell width="100px">Labels</Table.Header.Cell>
                <Table.Header.Cell>Joined</Table.Header.Cell>
                <Table.Header.Cell>Last Activity</Table.Header.Cell>
            </svelte:fragment>
            {#each data.users.users as user}
                <Table.Link href={`${base}/project-${projectId}/auth/user-${user.$id}`}>
                    <Table.Cell>
                        <Layout.Stack direction="row" alignItems="center">
                            {#if user.email || user.phone}
                                {#if user.name}
                                    <AvatarInitials size={32} name={user.name} />
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
                                size="x-small"
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
                            <Badge
                                size="x-small"
                                variant="secondary"
                                type="error"
                                content="blocked" />
                        {/if}
                    </Table.Cell>
                    <Table.Cell>
                        <Copy value={user.$id} event="user">
                            <Tag size="small">
                                <Icon size="small" icon={IconDuplicate} />
                                User ID
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
                    </Table.Cell>
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
            <Button href={`${base}/project-${projectId}/auth`} size="small" secondary>Clear Search</Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/references/cloud/server-nodejs/users"
            target="user"
            on:mousedown={() => showCreateUser.set(true)} />
    {/if}
</Container>

<Create bind:showCreate={$showCreateUser} on:created={userCreated} />
