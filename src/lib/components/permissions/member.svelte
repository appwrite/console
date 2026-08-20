<script lang="ts">
    import { Button, InputSearch } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import { AvatarInitials, EmptySearch, Modal, PaginationInline } from '..';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Query, Role, type Models } from '@appwrite.io/console';
    import type { Writable } from 'svelte/store';
    import type { Permission } from './permissions.svelte';
    import {
        Avatar,
        Card,
        Empty,
        Icon,
        Layout,
        Link,
        Selector,
        Spinner,
        Table,
        Typography
    } from '@appwrite.io/pink-svelte';
    import {
        IconAnonymous,
        IconArrowNarrowLeft,
        IconMinusSm,
        IconUsers
    } from '@appwrite.io/pink-icons-svelte';
    import { page } from '$app/state';

    export let show: boolean;
    export let groups: Writable<Map<string, Permission>>;

    const dispatch = createEventDispatcher();

    let search = '';
    let offset = 0;
    let isLoading = false;
    let hasSelection = false;
    let selected: Set<string> = new Set();
    let users: Models.UserList<Record<string, unknown>>;

    // A member role keys on a membership rather than a user, and memberships are searchable
    // only by their own ID, so the user is resolved first and their memberships listed after.
    let user: Models.User<Record<string, unknown>> = null;
    let memberships: Models.MembershipList;
    let membershipOffset = 0;

    // Searching and stepping between users both re-request, so responses can land out of
    // order; only the newest request is allowed to write to the list or clear the spinner.
    let latestRequest = 0;

    // Held separately from the lists: an empty list and a failed lookup both leave nothing to
    // show, and reporting a failure as "none found" would be a lie the operator cannot act on.
    let loadError = '';

    function clearUser() {
        user = null;
        memberships = undefined;
        membershipOffset = 0;
    }

    function reset() {
        offset = 0;
        search = '';
        selected.clear();
        clearUser();
        show = false;
    }

    function create() {
        dispatch('create', Array.from(selected));
        reset();
    }

    async function requestUsers() {
        if (!show || user) return;
        const requestId = ++latestRequest;
        isLoading = true;
        loadError = '';
        try {
            const response = await sdk
                .forProject(page.params.region, page.params.project)
                .users.list({
                    queries: [Query.limit(5), Query.offset(offset)],
                    search: search || undefined
                });
            if (requestId !== latestRequest) return;
            users = response;
        } catch (error) {
            if (requestId !== latestRequest) return;
            loadError = error.message;
            addNotification({ type: 'error', message: error.message });
        } finally {
            if (requestId === latestRequest) isLoading = false;
        }
    }

    async function requestMemberships() {
        if (!show || !user) return;
        const requestedUserId = user.$id;
        const requestId = ++latestRequest;
        isLoading = true;
        loadError = '';
        try {
            const response = await sdk
                .forProject(page.params.region, page.params.project)
                .users.listMemberships({
                    userId: requestedUserId,
                    queries: [Query.limit(5), Query.offset(membershipOffset)]
                });
            // Going back and picking someone else while this was in flight must not file
            // one user's memberships under another's name.
            if (requestId !== latestRequest || user?.$id !== requestedUserId) return;
            memberships = response;
        } catch (error) {
            if (requestId !== latestRequest) return;
            loadError = error.message;
            addNotification({ type: 'error', message: error.message });
        } finally {
            if (requestId === latestRequest) isLoading = false;
        }
    }

    function onSelection(role: string) {
        const checked = selected.has(role);
        if (checked) {
            selected.delete(role);
        } else {
            selected.add(role);
        }
        selected = selected;

        hasSelection = selected.size > 0;
    }

    $: if (show) {
        requestUsers();
    }
    $: if (offset !== null) {
        requestUsers();
    }
    $: if (search !== null) {
        offset = 0;
        requestUsers();
    }
    $: if (user) {
        requestMemberships();
    }
    $: if (membershipOffset !== null) {
        requestMemberships();
    }
</script>

<Modal title="Select memberships" bind:show onSubmit={create} on:close={reset}>
    <Typography.Text slot="description">
        Grant access to a user through one of their team memberships. Access is revoked
        automatically when they leave that team.
    </Typography.Text>

    {#if user}
        <Layout.Stack direction="row" alignItems="center" gap="s">
            <Button text size="s" on:click={clearUser}>
                <Icon icon={IconArrowNarrowLeft} size="s" />
                Back
            </Button>
            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                {user.name || user.email || user.phone || user.$id}
            </Typography.Caption>
        </Layout.Stack>

        {#if memberships?.memberships?.length}
            <Table.Root columns={[{ id: 'checkbox', width: 40 }, { id: 'team' }]} let:root>
                {#each memberships.memberships as membership (membership.$id)}
                    {@const role = Role.member(membership.$id)}
                    {@const exists = $groups.has(role)}
                    <Table.Row.Button {root} on:click={() => onSelection(role)} disabled={exists}>
                        <Table.Cell column="checkbox" {root}>
                            <div style:pointer-events="none">
                                <Selector.Checkbox
                                    size="s"
                                    id={membership.$id}
                                    disabled={exists}
                                    checked={exists || selected.has(role)} />
                            </div>
                        </Table.Cell>
                        <Table.Cell column="team" {root}>
                            <Layout.Stack direction="row" alignItems="center" gap="s">
                                <Avatar size="xs">
                                    <Icon icon={IconUsers} size="s" />
                                </Avatar>
                                <Layout.Stack gap="none">
                                    <Typography.Caption variant="400">
                                        {membership.teamName || membership.teamId}
                                    </Typography.Caption>
                                    <Typography.Caption
                                        variant="400"
                                        color="--fgcolor-neutral-tertiary">
                                        {membership.$id}
                                    </Typography.Caption>
                                </Layout.Stack>
                            </Layout.Stack>
                        </Table.Cell>
                    </Table.Row.Button>
                {/each}
            </Table.Root>

            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <p class="text">Total results: {memberships?.total}</p>
                <PaginationInline
                    limit={5}
                    bind:offset={membershipOffset}
                    total={memberships?.total}
                    hidePages
                    on:change={requestMemberships} />
            </Layout.Stack>
        {:else if isLoading}
            <!-- 275px nearly matches the height of at-least 5 items in the table above -->
            <div style:margin-inline="auto" style:min-height="275px" style:align-content="center">
                <Spinner size="m" />
            </div>
        {:else if loadError}
            <Card.Base padding="none">
                <Empty title="Could not load memberships." type="secondary">
                    <Typography.Text slot="description">{loadError}</Typography.Text>
                    <svelte:fragment slot="actions">
                        <Button secondary on:click={requestMemberships}>Retry</Button>
                    </svelte:fragment>
                </Empty>
            </Card.Base>
        {:else}
            <Card.Base padding="none">
                <Empty title="This user is not a member of any team." type="secondary">
                    <Typography.Text slot="description">
                        Add them to a team to grant access this way, or learn more in our <Link.Anchor
                            href="https://appwrite.io/docs/products/auth/teams"
                            target="_blank"
                            rel="noopener noreferrer">
                            documentation</Link.Anchor
                        >.
                    </Typography.Text>
                </Empty>
            </Card.Base>
        {/if}
    {:else if users?.users?.length}
        <InputSearch
            autofocus
            placeholder="Search by name, email, phone or ID"
            bind:value={search} />

        <Table.Root columns={[{ id: 'user' }]} let:root>
            {#each users.users as item (item.$id)}
                <Table.Row.Button {root} on:click={() => (user = item)}>
                    <Table.Cell column="user" {root}>
                        <Layout.Stack direction="row" alignItems="center" gap="s">
                            {#if item.name}
                                <AvatarInitials size="xs" name={item.name} />
                            {:else}
                                <Avatar size="xs">
                                    <Icon
                                        icon={item.email || item.phone
                                            ? IconMinusSm
                                            : IconAnonymous}
                                        size="s" />
                                </Avatar>
                            {/if}
                            <Layout.Stack gap="none">
                                <Typography.Caption variant="400">
                                    {item.name || item.email || item.phone || '-'}
                                </Typography.Caption>
                                <Typography.Caption
                                    variant="400"
                                    color="--fgcolor-neutral-tertiary">
                                    {item.$id}
                                </Typography.Caption>
                            </Layout.Stack>
                        </Layout.Stack>
                    </Table.Cell>
                </Table.Row.Button>
            {/each}
        </Table.Root>

        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
            <p class="text">Total results: {users?.total}</p>
            <PaginationInline
                limit={5}
                bind:offset
                total={users?.total}
                hidePages
                on:change={requestUsers} />
        </Layout.Stack>
    {:else if loadError}
        <InputSearch
            autofocus
            placeholder="Search by name, email, phone or ID"
            bind:value={search} />

        <Card.Base padding="none">
            <Empty title="Could not load users." type="secondary">
                <Typography.Text slot="description">{loadError}</Typography.Text>
                <svelte:fragment slot="actions">
                    <Button secondary on:click={requestUsers}>Retry</Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {:else if search}
        <InputSearch
            autofocus
            placeholder="Search by name, email, phone or ID"
            bind:value={search} />

        <EmptySearch bind:search target="users" hidePages>
            <Button
                external
                href="https://appwrite.io/docs/products/auth/users"
                text
                event="empty_documentation"
                size="s">Documentation</Button>
            <Button secondary on:click={() => (search = '')}>Clear search</Button>
        </EmptySearch>
    {:else if isLoading}
        <!-- 275px nearly matches the height of at-least 5 items in the table above -->
        <div style:margin-inline="auto" style:min-height="275px" style:align-content="center">
            <Spinner size="m" />
        </div>
    {:else}
        <Card.Base padding="none">
            <Empty title="No users yet. Create a user to see it here." type="secondary">
                <Typography.Text slot="description">
                    Need a hand? Learn more in our <Link.Anchor
                        href="https://appwrite.io/docs/products/auth/users"
                        target="_blank"
                        rel="noopener noreferrer">
                        documentation</Link.Anchor
                    >.
                </Typography.Text>
            </Empty>
        </Card.Base>
    {/if}

    <svelte:fragment slot="footer">
        <Button submit disabled={!hasSelection}>Add</Button>
    </svelte:fragment>
</Modal>
