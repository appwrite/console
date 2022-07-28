<script lang="ts">
    import { page } from '$app/stores';
    import { Pagination, Empty, Avatar, Search } from '$lib/components';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRowLink,
        TableCellHead,
        TableCellText
    } from '$lib/elements/table';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import type { Models } from '@aw-labs/appwrite-console';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { sdkForProject } from '$lib/stores/sdk';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { memberships } from './store';
    import CreateMember from './_createMembership.svelte';
    import DeleteMembership from './_deleteMembership.svelte';

    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 32, 32).toString();
    const deleted = () => memberships.load($page.params.team, search, limit, offset ?? 0);

    const project = $page.params.project;

    let showCreate = false;
    let showDelete = false;
    let search = '';
    let offset: number = null;
    let selectedMembership: Models.Membership;

    const limit = 5;

    $: if (search) offset = 0;
    $: memberships.load($page.params.team, search, limit, offset ?? 0);

    const memberCreated = async (event: CustomEvent<Models.Membership>) => {
        memberships.load($page.params.team, search, limit, offset ?? 0);
        await goto(`${base}/console/${project}/users/teams/${event.detail.teamId}/members`);
    };
</script>

<Container>
    <Search bind:search placeholder="Search by ID">
        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create membership</span>
        </Button>
    </Search>
    {#if $memberships?.total}
        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead>Role</TableCellHead>
                <TableCellHead>Joined</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each $memberships.memberships as membership}
                    <TableRowLink
                        href={`${base}/console/${project}/users/user/${membership.userId}`}>
                        <TableCellText title="Name">
                            <div class="u-flex u-gap-12">
                                <Avatar
                                    size={32}
                                    src={getAvatar(membership.userName)}
                                    name={membership.userName} />

                                <span>{membership.userName ? membership.userName : 'n/a'}</span>
                            </div>
                        </TableCellText>
                        <TableCellText title="Role">{membership.roles}</TableCellText>
                        <TableCellText title="Joined"
                            >{toLocaleDateTime(membership.joined)}</TableCellText>
                        <TableCellText title="">
                            <button
                                class="button is-only-icon is-text"
                                aria-label="Delete item"
                                on:click|preventDefault={() => {
                                    selectedMembership = membership;
                                    showDelete = true;
                                }}>
                                <span class="icon-trash" aria-hidden="true" />
                            </button>
                        </TableCellText>
                    </TableRowLink>
                {/each}
            </TableBody>
        </Table>
        <div
            class="u-flex u-margin-block-start-32
 u-main-space-between">
            <p class="text">Total results: {$memberships.total}</p>
            <Pagination {limit} bind:offset sum={$memberships.total} />
        </div>
    {:else if search}
        <Empty>
            <div class="u-flex u-flex-vertical">
                <b>Sorry, we couldn’t find ‘{search}’</b>
                <div class="common-section">
                    <p>There are no members that match your search.</p>
                </div>
                <div class="common-section">
                    <Button secondary on:click={() => (search = '')}>Clear Search</Button>
                </div>
            </div>
        </Empty>
        <div
            class="u-flex u-margin-block-start-32
 u-main-space-between">
            <p class="text">Total results: {$memberships.total}</p>
            <Pagination {limit} bind:offset sum={$memberships.total} />
        </div>
    {:else}
        <Empty dashed centered>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="common-section">
                    <Button secondary round on:click={() => (showCreate = true)}>
                        <span class="icon-plus" aria-hidden="true" />
                    </Button>
                </div>
                <div class="common-section">
                    <p>Add your first member to get started</p>
                </div>
                <div class="common-section">
                    <Button external secondary href="#">Documentation</Button>
                </div>
            </div>
        </Empty>
    {/if}
</Container>

<CreateMember teamId={$page.params.team} bind:showCreate on:created={memberCreated} />
<DeleteMembership {selectedMembership} bind:showDelete on:deleted={() => deleted()} />
