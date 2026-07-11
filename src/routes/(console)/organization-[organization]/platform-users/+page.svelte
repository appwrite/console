<script lang="ts">
    import { AvatarInitials, PaginationWithLimit, SearchQuery } from '$lib/components';
    import { Container } from '$lib/layout';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import type { Models } from '@appwrite.io/console';
    import DeleteConsoleUser from './deleteConsoleUser.svelte';
    import { isOwner } from '$lib/stores/roles';
    import { user } from '$lib/stores/user';
    import { IconDotsHorizontal, IconTrash } from '@appwrite.io/pink-icons-svelte';
    import {
        Layout,
        Table,
        Badge,
        Button,
        Icon,
        Typography,
        Popover,
        ActionMenu
    } from '@appwrite.io/pink-svelte';

    export let data;

    let selectedUser: Models.User<Record<string, unknown>> | null = null;
    let showDelete = false;
</script>

<Container>
    <Layout.Stack gap="l">
        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
            <Layout.Stack gap="xxs">
                <Typography.Title>Platform users</Typography.Title>
                <Typography.Text>
                    Manage all console accounts on this self-hosted instance. Permanently deleting a
                    user removes their account system-wide — not only from a single organization.
                </Typography.Text>
            </Layout.Stack>
            <SearchQuery placeholder="Search by name, email, phone, or ID" />
        </Layout.Stack>

        {#if data.users.total}
            <Table.Root
                let:root
                columns={[
                    { id: 'name', width: { min: 200 } },
                    { id: 'email', width: { min: 220 } },
                    { id: 'status', width: { min: 100 } },
                    { id: 'created', width: { min: 140 } },
                    { id: 'actions', hide: !$isOwner, width: 40 }
                ]}>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell column="name" {root}>Name</Table.Header.Cell>
                    <Table.Header.Cell column="email" {root}>Email</Table.Header.Cell>
                    <Table.Header.Cell column="status" {root}>Status</Table.Header.Cell>
                    <Table.Header.Cell column="created" {root}>Created</Table.Header.Cell>
                    <Table.Header.Cell column="actions" {root} />
                </svelte:fragment>
                {#each data.users.users as consoleUser (consoleUser.$id)}
                    <Table.Row.Base {root}>
                        <Table.Cell column="name" {root}>
                            <Layout.Stack direction="row" alignItems="center" gap="s">
                                <AvatarInitials size="xs" name={consoleUser.name || consoleUser.email} />
                                <Layout.Stack direction="row" alignItems="center" gap="s">
                                    <Typography.Text truncate>
                                        {consoleUser.name || 'n/a'}
                                    </Typography.Text>
                                    {#if consoleUser.$id === $user?.$id}
                                        <Badge size="xs" variant="secondary" content="You" />
                                    {/if}
                                </Layout.Stack>
                            </Layout.Stack>
                        </Table.Cell>
                        <Table.Cell column="email" {root}>
                            <Typography.Text truncate>{consoleUser.email || '—'}</Typography.Text>
                        </Table.Cell>
                        <Table.Cell column="status" {root}>
                            <Badge
                                size="xs"
                                type={consoleUser.status ? 'success' : 'error'}
                                variant="secondary"
                                content={consoleUser.status ? 'Enabled' : 'Disabled'} />
                        </Table.Cell>
                        <Table.Cell column="created" {root}>
                            <DualTimeView time={consoleUser.$createdAt} />
                        </Table.Cell>
                        <Table.Cell column="actions" {root}>
                            {#if $isOwner && consoleUser.$id !== $user?.$id}
                                <Popover let:toggle padding="none" placement="bottom-end">
                                    <Button.Button icon variant="ghost" size="s" on:click={toggle}>
                                        <Icon size="s" icon={IconDotsHorizontal} />
                                    </Button.Button>
                                    <div style:min-width="232px" slot="tooltip">
                                        <ActionMenu.Root>
                                            <ActionMenu.Item.Button
                                                trailingIcon={IconTrash}
                                                on:click={() => {
                                                    selectedUser = consoleUser;
                                                    showDelete = true;
                                                }}>
                                                Delete permanently
                                            </ActionMenu.Item.Button>
                                        </ActionMenu.Root>
                                    </div>
                                </Popover>
                            {/if}
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>

            <PaginationWithLimit
                name="Users"
                limit={data.limit}
                offset={data.offset}
                total={data.users.total} />
        {:else if data.search}
            <Typography.Text>
                No platform users found matching "{data.search}".
            </Typography.Text>
        {:else}
            <Typography.Text>No platform users found.</Typography.Text>
        {/if}
    </Layout.Stack>
</Container>

<DeleteConsoleUser {selectedUser} bind:showDelete />
