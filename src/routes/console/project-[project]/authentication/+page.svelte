<script lang="ts">
    import { page } from '$app/stores';
    import { Empty, EmptySearch, Pagination, Copy, Search, AvatarInitials } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableHeader,
        TableBody,
        TableCellHead,
        TableCell,
        TableCellText,
        TableRowLink
    } from '$lib/elements/table';
    import Create from './_createUser.svelte';
    import { goto } from '$app/navigation';
    import { event } from '$lib/actions/analytics';
    import { Pill } from '$lib/elements';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { usersList } from './store';
    import { Query, type Models } from '@aw-labs/appwrite-console';
    import { pageLimit } from '$lib/stores/layout';
    import { createPersistentPagination } from '$lib/stores/pagination';

    let showCreate = false;
    let search = '';
    const offset = createPersistentPagination($pageLimit);

    const project = $page.params.project;
    const userCreated = async (event: CustomEvent<Models.User<Record<string, unknown>>>) => {
        await goto(`${base}/console/project-${project}/authentication/user/${event.detail.$id}`);
    };

    $: if (search) $offset = 0;
    $: usersList.load(
        [Query.limit($pageLimit), Query.offset($offset), Query.orderDesc('$createdAt')],
        search
    );
</script>

<Container>
    <Search bind:search placeholder="Search by name, email, or ID">
        <span
            use:event={{
                name: 'console_users',
                action: 'click_create',
                parameters: {
                    type: 'user'
                }
            }}>
            <Button on:click={() => (showCreate = true)}>
                <span class="icon-plus" aria-hidden="true" /> <span class="text">Create user</span>
            </Button>
        </span>
    </Search>
    {#if $usersList?.total}
        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead>Identifiers</TableCellHead>
                <TableCellHead width={130}>Status</TableCellHead>
                <TableCellHead width={100}>ID</TableCellHead>
                <TableCellHead>Joined</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each $usersList.users as user}
                    <TableRowLink
                        href={`${base}/console/project-${project}/authentication/user/${user.$id}`}>
                        <TableCell title="Name">
                            <div class="u-flex u-gap-12 u-cross-center">
                                {#if user.email || user.phone}
                                    {#if user.name}
                                        <AvatarInitials size={32} name={user.name} />
                                        <span class="text u-trim">{user.name}</span>
                                    {:else}
                                        <div class="avatar is-size-small ">
                                            <span class="icon-minus-sm" aria-hidden="true" />
                                        </div>
                                    {/if}
                                {:else}
                                    <div class="avatar is-size-small ">
                                        <span class="icon-anonymous" aria-hidden="true" />
                                    </div>
                                    <span class="text u-trim">{user.name}</span>
                                {/if}
                            </div>
                        </TableCell>
                        <TableCellText title="Identifiers">
                            {user.email && user.phone
                                ? [user.email, user.phone].join(',')
                                : user.email || user.phone}
                        </TableCellText>
                        <TableCell title="Status">
                            {#if user.status}
                                <Pill success={user.emailVerification || user.phoneVerification}>
                                    {user.emailVerification && user.phoneVerification
                                        ? 'verified'
                                        : user.emailVerification
                                        ? 'verified email'
                                        : user.phoneVerification
                                        ? 'verified phone'
                                        : 'unverified'}
                                </Pill>
                            {:else}
                                <Pill danger>blocked</Pill>
                            {/if}
                        </TableCell>
                        <TableCell showOverflow title="ID">
                            <Copy value={user.$id}>
                                <Pill button
                                    ><span class="icon-duplicate" aria-hidden="true" />
                                    <span class="text">User ID</span></Pill>
                            </Copy>
                        </TableCell>
                        <TableCellText title="Joined">
                            {toLocaleDateTime(user.registration)}
                        </TableCellText>
                    </TableRowLink>
                {/each}
            </TableBody>
        </Table>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$usersList.total}</p>
            <Pagination limit={$pageLimit} bind:offset={$offset} sum={$usersList.total} />
        </div>
    {:else if search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn’t find ‘{search}’</b>
                <p>There are no users that match your search.</p>
            </div>
            <Button secondary on:click={() => (search = '')}>Clear Search</Button>
        </EmptySearch>
    {:else}
        <Empty isButton single on:click={() => (showCreate = true)}>
            <div
                class="common-section"
                use:event={{
                    name: 'console_users',
                    action: 'click_create',
                    parameters: {
                        type: 'user'
                    }
                }}>
                <div class="u-text-center common-section">
                    <p>Create your first User to get started.</p>
                    <p>Need a hand? Check out our documentation.</p>
                </div>
                <div class="u-flex u-gap-16 common-section u-main-center">
                    <Button external href="#/" text>Documentation</Button>
                    <Button secondary>Create User</Button>
                </div>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={userCreated} />
