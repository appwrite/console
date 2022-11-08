<script lang="ts">
    import { page } from '$app/stores';
    import { base } from '$app/paths';
    import { Empty, AvatarInitials } from '$lib/components';
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
    import DeleteMembership from '../../deleteMembership.svelte';
    import DeleteAllMemberships from '../../deleteAllMemberships.svelte';
    import type { Models } from '@aw-labs/appwrite-console';
    import type { PageData } from './$types';

    export let data: PageData;

    let selectedMembership: Models.Membership;
    let showDelete = false;
    let showDeleteAll = false;

    const project = $page.params.project;
</script>

<Container>
    {#if data.memberships.total}
        <div class="u-flex u-main-end  common-section">
            <Button secondary on:click={() => (showDeleteAll = true)}>
                <span class="text">Delete All</span>
            </Button>
        </div>
        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead>Role</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each data.memberships.memberships as membership}
                    <TableRowLink
                        href={`${base}/console/project-${project}/auth/teams/team-${membership.teamId}`}>
                        <TableCellText title="Name">
                            <div class="u-flex u-gap-12">
                                <AvatarInitials size={32} name={membership.teamName} />
                                <span>{membership.teamName ? membership.teamName : 'n/a'}</span>
                            </div>
                        </TableCellText>
                        <TableCellText title="Role">{membership.roles}</TableCellText>
                        <TableCell>
                            <button
                                class="button is-only-icon is-text"
                                aria-label="Delete item"
                                on:click|preventDefault={() => {
                                    selectedMembership = membership;
                                    showDelete = true;
                                }}>
                                <span class="icon-trash" aria-hidden="true" />
                            </button>
                        </TableCell>
                    </TableRowLink>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <Empty single>
            <p>No memberships available</p>
            <Button
                external
                secondary
                href="https://appwrite.io/docs/server/auth?sdk=nodejs-default#usersGetMemberships"
                >Documentation</Button>
        </Empty>
    {/if}
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {data.memberships.total}</p>
        <!-- <Pagination limit={PAGE_LIMIT} bind:offset={$offset} sum={data.total} /> -->
    </div>
</Container>

<DeleteMembership {selectedMembership} bind:showDelete />
<DeleteAllMemberships bind:showDeleteAll />
