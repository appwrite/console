<script lang="ts">
    import { page } from '$app/stores';
    import { Empty, EmptySearch, Search, AvatarInitials } from '$lib/components';
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
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { PageData } from './$types';
    import CreateMember from '../../createMembership.svelte';
    import DeleteMembership from '../../deleteMembership.svelte';
    import { Dependencies } from '$lib/constants';

    export let data: PageData;

    let showCreate = false;
    let showDelete = false;
    let search = '';
    let selectedMembership: Models.Membership;

    const project = $page.params.project;

    async function memberCreated(event: CustomEvent<Models.Membership>) {
        await goto(
            `${base}/console/project-${project}/authentication/teams-${event.detail.teamId}/members`
        );
    }
</script>

<Container>
    <Search bind:search placeholder="Search by ID">
        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create membership</span>
        </Button>
    </Search>
    {#if data.memberships.total}
        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead>Role</TableCellHead>
                <TableCellHead>Joined</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each data.memberships.memberships as membership}
                    <TableRowLink
                        href={`${base}/console/project-${project}/authentication/user-${membership.userId}`}>
                        <TableCellText title="Name">
                            <div class="u-flex u-gap-12">
                                <AvatarInitials size={32} name={membership.userName} />
                                <span>{membership.userName ? membership.userName : 'n/a'}</span>
                            </div>
                        </TableCellText>
                        <TableCellText title="Role">{membership.roles}</TableCellText>
                        <TableCellText title="Joined">
                            {toLocaleDateTime(membership.joined)}
                        </TableCellText>
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
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {data.memberships.total}</p>
            <!-- <Pagination limit={$pageLimit} bind:offset={$offset} sum={$memberships.total} /> -->
        </div>
    {:else if search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn’t find ‘{search}’</b>
                <p>There are no members that match your search.</p>
            </div>
            <Button secondary on:click={() => (search = '')}>Clear Search</Button>
        </EmptySearch>
    {:else}
        <Empty isButton single on:click={() => (showCreate = true)}>
            <p>Add your first member to get started</p>
        </Empty>
    {/if}
</Container>

<CreateMember teamId={$page.params.team} bind:showCreate on:created={memberCreated} />
<DeleteMembership
    {selectedMembership}
    bind:showDelete
    on:deleted={() => invalidate(Dependencies.MEMBERSHIPS)} />
