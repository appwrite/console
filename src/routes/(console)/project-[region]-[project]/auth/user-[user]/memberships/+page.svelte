<script lang="ts">
    import { page } from '$app/stores';
    import { base } from '$app/paths';
    import { AvatarInitials, EmptySearch } from '$lib/components';
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
    import DeleteMembership from '../deleteMembership.svelte';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { trackEvent } from '$lib/actions/analytics';
    import { toLocaleDateTime } from '$lib/helpers/date';

    export let data: PageData;

    let selectedMembership: Models.Membership;
    let showDelete = false;

    const project = $page.params.project;
</script>

<Container>
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
                    <TableRowLink
                        href={`${base}/project-${$page.params.region}-${project}/auth/teams/team-${membership.teamId}`}>
                        <TableCellText title="Name">
                            <div class="u-flex u-cross-center u-gap-12">
                                <AvatarInitials size={32} name={membership.teamName} />
                                <span>{membership.teamName ? membership.teamName : 'n/a'}</span>
                            </div>
                        </TableCellText>
                        <TableCellText onlyDesktop title="Roles">{membership.roles}</TableCellText>
                        <TableCellText onlyDesktop title="Joined">
                            {toLocaleDateTime(membership.joined)}
                        </TableCellText>
                        <TableCell width={30}>
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
    {:else}
        <EmptySearch>
            <div class="u-flex u-flex-vertical u-cross-center u-gap-24">
                <p class="text u-line-height-1-5">No memberships available</p>
                <Button
                    external
                    secondary
                    href="https://appwrite.io/docs/products/auth/teams#create-membership">
                    Documentation
                </Button>
            </div>
        </EmptySearch>
    {/if}
</Container>

<DeleteMembership {selectedMembership} bind:showDelete />
