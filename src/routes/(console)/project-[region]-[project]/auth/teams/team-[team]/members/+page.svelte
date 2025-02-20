<script lang="ts">
    import { page } from '$app/stores';
    import {
        Empty,
        EmptySearch,
        AvatarInitials,
        SearchQuery,
        PaginationWithLimit
    } from '$lib/components';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRowLink,
        TableCellHead,
        TableCellText,
        TableCell
    } from '$lib/elements/table';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { PageData } from './$types';
    import CreateMember from '../createMembership.svelte';
    import DeleteMembership from '../deleteMembership.svelte';
    import { Dependencies } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';

    export let data: PageData;

    let showCreate = false;
    let showDelete = false;
    let selectedMembership: Models.Membership;

    const project = $page.params.project;

    async function memberCreated() {
        invalidate(Dependencies.MEMBERSHIPS);
    }
</script>

<Container>
    <SearchQuery search={data.search} placeholder="Search by ID">
        <Button on:click={() => (showCreate = true)} event="create_membership">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create membership</span>
        </Button>
    </SearchQuery>
    {#if data.memberships.total}
        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead onlyDesktop>Roles</TableCellHead>
                <TableCellHead onlyDesktop>Joined</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each data.memberships.memberships as membership}
                    {@const username = membership.userName ? membership.userName : '-'}
                    <TableRowLink
                        href={`${base}/project-${$page.params.region}-${project}/auth/user-${membership.userId}`}>
                        <TableCellText title="Name">
                            <div class="u-flex u-gap-12 u-cross-center">
                                <AvatarInitials size={32} name={username} />
                                <span>{username}</span>
                            </div>
                        </TableCellText>
                        <TableCellText onlyDesktop title="Roles">{membership.roles}</TableCellText>
                        <TableCellText onlyDesktop title="Joined">
                            {toLocaleDateTime(membership.joined)}
                        </TableCellText>
                        <TableCell>
                            <button
                                class="button is-only-icon is-text"
                                aria-label="Delete item"
                                on:click|preventDefault={() => {
                                    selectedMembership = membership;
                                    showDelete = true;
                                    trackEvent('click_delete_membership');
                                }}>
                                <span class="icon-trash" aria-hidden="true" />
                            </button>
                        </TableCell>
                    </TableRowLink>
                {/each}
            </TableBody>
        </Table>

        <PaginationWithLimit
            name="Memberships"
            limit={data.limit}
            offset={data.offset}
            total={data.memberships.total} />
    {:else if data.search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find ‘{data.search}'</b>
                <p>There are no members that match your search.</p>
            </div>
            <Button
                external
                href="https://appwrite.io/docs/products/auth/teams#create-membership"
                text>
                Documentation
            </Button>
            <Button secondary on:click={() => (showCreate = true)}>Create membership</Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/products/auth/teams"
            target="membership"
            on:click={() => (showCreate = true)} />
    {/if}
</Container>

<CreateMember teamId={$page.params.team} bind:showCreate on:created={memberCreated} />
<DeleteMembership
    {selectedMembership}
    bind:showDelete
    on:deleted={() => invalidate(Dependencies.MEMBERSHIPS)} />
