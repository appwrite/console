<script lang="ts">
    import { page } from '$app/stores';
    import { Empty, EmptySearch, AvatarInitials, Pagination, SearchQuery } from '$lib/components';
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
    import { Dependencies, PAGE_LIMIT } from '$lib/constants';

    export let data: PageData;

    let showCreate = false;
    let showDelete = false;
    let selectedMembership: Models.Membership;

    const project = $page.params.project;

    async function memberCreated(event: CustomEvent<Models.Membership>) {
        await goto(`${base}/console/project-${project}/auth/teams-${event.detail.teamId}/members`);
    }
</script>

<Container>
    <SearchQuery search={data.search} placeholder="Search by ID">
        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create membership</span>
        </Button>
    </SearchQuery>
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
                        href={`${base}/console/project-${project}/auth/user-${membership.userId}`}>
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
            <Pagination
                limit={PAGE_LIMIT}
                path={`/console/project-${$page.params.project}/auth/teams/team-${$page.params.team}/members`}
                offset={data.offset}
                sum={data.memberships.total} />
        </div>
    {:else if data.search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn’t find ‘{data.search}’</b>
                <p>There are no members that match your search.</p>
            </div>
            <Button
                secondary
                href={`/console/project-${$page.params.project}/auth/teams/team-${$page.params.team}/members`}
                >Clear Search</Button>
        </EmptySearch>
    {:else}
        <Empty single on:click={() => (showCreate = true)}>
            <div class="u-text-center">
                <p class="text u-line-height-1-5">Add your first member to get started</p>
                <p class="text u-line-height-1-5">Need a hand? Check out our documentation.</p>
            </div>
            <div class="u-flex u-gap-16">
                <Button
                    external
                    href="https://appwrite.io/docs/client/teams?sdk=web-default#teamsCreateMembership"
                    text>
                    Documentation
                </Button>
                <Button secondary on:click={() => (showCreate = true)}>Create membership</Button>
            </div>
        </Empty>
    {/if}
</Container>

<CreateMember teamId={$page.params.team} bind:showCreate on:created={memberCreated} />
<DeleteMembership
    {selectedMembership}
    bind:showDelete
    on:deleted={() => invalidate(Dependencies.MEMBERSHIPS)} />
