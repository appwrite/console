<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Empty, Pagination, Avatar, Copy, Search } from '$lib/components';
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
    import { onMount } from 'svelte';
    import type { Models } from '@aw-labs/appwrite-console';

    let showCreate = false;
    let search = '';
    let offset: number = null;

    const limit = 5;
    const project = $page.params.project;
    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 32, 32).toString();
    const userCreated = async (event: CustomEvent<Models.User<Record<string, unknown>>>) => {
        await goto(`${base}/console/${project}/users/user/${event.detail.$id}`);
    };

    $: usersList.load(search, limit, offset ?? 0);
    $: if (search) offset = 0;
    $: {
        //TODO: refactor this into something maintainable without the use of goto
        if (offset !== null) {
            $page.url.searchParams.set('offset', offset.toString());
            goto(`?${$page.url.searchParams.toString()}`, { replaceState: true, keepfocus: true });
        }
    }

    onMount(() => {
        const queryOffset = +$page.url.searchParams.get('offset') ?? 0;
        if (offset && offset !== queryOffset) {
            offset = queryOffset;
        }
    });
</script>

<Container>
    <Search bind:search placeholder="Search Name, Email, or ID">
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
                <TableCellHead>Email</TableCellHead>
                <TableCellHead width={100}>Status</TableCellHead>
                <TableCellHead width={100}>ID</TableCellHead>
                <TableCellHead>Joined</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each $usersList.users as user}
                    <TableRowLink href={`${base}/console/${project}/users/user/${user.$id}`}>
                        <TableCellText title="Name">
                            <div class="u-flex u-gap-12 u-cross-center">
                                <Avatar size={32} src={getAvatar(user.name)} name={user.name} />
                                <span class="text">{user.name ? user.name : 'n/a'}</span>
                            </div>
                        </TableCellText>
                        <TableCellText title="Email">{user.email}</TableCellText>
                        <TableCell title="Status">
                            {#if user.status}
                                <Pill success={user.emailVerification}>
                                    {user.emailVerification ? 'Verified' : 'Unverified'}
                                </Pill>
                            {:else}
                                <Pill danger>Blocked</Pill>
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
            <Pagination {limit} bind:offset sum={$usersList.total} />
        </div>
    {:else if search}
        <Empty>
            <div class="u-flex u-flex-vertical">
                <b>Sorry, we couldn’t find ‘{search}’</b>
                <div class="common-section">
                    <p>There are no users that match your search.</p>
                </div>
                <div class="common-section">
                    <Button secondary on:click={() => (search = '')}>Clear Search</Button>
                </div>
            </div>
        </Empty>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$usersList.total}</p>
            <Pagination {limit} bind:offset sum={$usersList.total} />
        </div>
    {:else}
        <Empty dashed centered>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div
                    class="common-section"
                    use:event={{
                        name: 'console_users',
                        action: 'click_create',
                        parameters: {
                            type: 'user'
                        }
                    }}>
                    <Button secondary round on:click={() => (showCreate = true)}>
                        <span class="icon-plus" aria-hidden="true" />
                    </Button>
                </div>
                <div class="common-section">
                    <p>Add Your First User To Get Started</p>
                </div>
                <div class="common-section">
                    <Button secondary href="#">Documentation</Button>
                </div>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={userCreated} />
