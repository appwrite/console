<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Empty, Pagination } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRow,
        TableCellHead,
        TableCellText,
        TableRowLink
    } from '$lib/elements/table';
    import Create from './_createUser.svelte';
    import type { Models } from 'src/sdk';
    import { goto } from '$app/navigation';
    import { Pill } from '$lib/elements';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { usersList } from './store';
    import { onMount } from 'svelte';

    let showCreate = false;
    let search = '';
    let offset: number = null;

    const limit = 5;
    const project = $page.params.project;
    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 40, 40).toString();
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

    const copy = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            addNotification({
                message: 'Copied to clipboard.',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    };
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <div class="input-text-wrapper u-stretch" style="max-width: 500px">
            <input
                type="search"
                placeholder="Search Name, Email, or ID"
                class="input-text"
                bind:value={search} />
            <span class="icon-search" aria-hidden="true" />
        </div>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create User</span>
        </Button>
    </div>
    {#if $usersList?.response?.total}
        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead>E-Mail</TableCellHead>
                <TableCellHead width={100}>Status</TableCellHead>
                <TableCellHead width={100}>ID</TableCellHead>
                <TableCellHead>Joined</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each $usersList.response.users as user}
                    <TableRowLink href={`${base}/console/${project}/users/user/${user.$id}`}>
                        <TableCellText title="Name">
                            <div class="u-flex u-gap-12">
                                <img
                                    class="avatar"
                                    width="40"
                                    height="40"
                                    src={getAvatar(user.name)}
                                    alt={user.name} />
                                <span>{user.name ? user.name : 'n/a'}</span>
                            </div>
                        </TableCellText>
                        <TableCellText title="E-Mail">{user.email}</TableCellText>
                        <TableCellText title="Status">
                            {#if user.status}
                                <Pill success={user.emailVerification}>
                                    {user.emailVerification ? 'Verified' : 'Unverified'}
                                </Pill>
                            {:else}
                                <Pill danger>Blocked</Pill>
                            {/if}
                        </TableCellText>
                        <TableCellText title="ID">
                            <Pill button on:click={() => copy(user.$id)}
                                ><i class="icon-duplicate" />User ID
                            </Pill>
                        </TableCellText>
                        <TableCellText title="Joined">
                            {toLocaleDateTime(user.registration)}
                        </TableCellText>
                    </TableRowLink>
                {/each}
            </TableBody>
        </Table>
        <div class="u-flex common-section u-main-space-between">
            <p class="text">Total results: {$usersList.response.total}</p>
            <Pagination {limit} bind:offset sum={$usersList.response.total} />
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
        <div class="u-flex common-section u-main-space-between">
            <p class="text">Total results: {$usersList.response.total}</p>
            <Pagination {limit} bind:offset sum={$usersList.response.total} />
        </div>
    {:else}
        <Empty dashed centered>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="common-section">
                    <Button secondary round on:click={() => (showCreate = true)}>
                        <i class="icon-plus" />
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
