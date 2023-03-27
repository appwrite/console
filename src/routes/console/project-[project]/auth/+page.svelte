<script lang="ts">
    import { page } from '$app/stores';
    import {
        Empty,
        EmptySearch,
        Copy,
        SearchQuery,
        AvatarInitials,
        PaginationWithLimit
    } from '$lib/components';
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
    import { Pill } from '$lib/elements';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { goto } from '$app/navigation';
    import Create from './createUser.svelte';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';

    export let data: PageData;

    let showCreate = false;
    const projectId = $page.params.project;
    async function userCreated(event: CustomEvent<Models.User<Record<string, unknown>>>) {
        await goto(`${base}/console/project-${projectId}/auth/user-${event.detail.$id}`);
    }
</script>

<Container>
    <SearchQuery search={data.search} placeholder="Search by name, email, phone, or ID">
        <Button on:click={() => (showCreate = true)} event="create_user">
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create user</span>
        </Button>
    </SearchQuery>
    {#if data.users.total}
        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead onlyDesktop>Identifiers</TableCellHead>
                <TableCellHead onlyDesktop width={130}>Status</TableCellHead>
                <TableCellHead onlyDesktop width={100}>ID</TableCellHead>
                <TableCellHead onlyDesktop>Joined</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each data.users.users as user}
                    <TableRowLink
                        href={`${base}/console/project-${projectId}/auth/user-${user.$id}`}>
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
                        <TableCellText onlyDesktop title="Identifiers">
                            {user.email && user.phone
                                ? [user.email, user.phone].join(',')
                                : user.email || user.phone}
                        </TableCellText>
                        <TableCell onlyDesktop title="Status">
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
                        <TableCell onlyDesktop showOverflow title="ID">
                            <Copy value={user.$id} event="user">
                                <Pill button>
                                    <span class="icon-duplicate" aria-hidden="true" />
                                    <span class="text">User ID</span>
                                </Pill>
                            </Copy>
                        </TableCell>
                        <TableCellText onlyDesktop title="Joined">
                            {toLocaleDateTime(user.registration)}
                        </TableCellText>
                    </TableRowLink>
                {/each}
            </TableBody>
        </Table>

        <PaginationWithLimit
            name="Users"
            limit={data.limit}
            offset={data.offset}
            total={data.users.total} />
    {:else if data.search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find '{data.search}'</b>
                <p>There are no users that match your search.</p>
            </div>
            <Button href={`/console/project-${projectId}/auth`} secondary>Clear Search</Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/server/users"
            target="user"
            on:click={() => (showCreate = true)} />
    {/if}
</Container>

<Create bind:showCreate on:created={userCreated} />
