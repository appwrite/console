<script lang="ts">
    import { page } from '$app/stores';
    import { base } from '$app/paths';
    import { AvatarInitials, EmptySearch } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import DeleteMembership from '../deleteMembership.svelte';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { trackEvent } from '$lib/actions/analytics';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Table, Layout } from '@appwrite.io/pink-svelte';

    export let data: PageData;

    let selectedMembership: Models.Membership;
    let showDelete = false;

    const project = $page.params.project;
</script>

<Container>
    {#if data.memberships.total}
        <Table.Root>
            <svelte:fragment slot="header">
                <Table.Header.Cell>Name</Table.Header.Cell>
                <Table.Header.Cell>Roles</Table.Header.Cell>
                <Table.Header.Cell>Joined</Table.Header.Cell>
                <Table.Header.Cell />
            </svelte:fragment>
            {#each data.memberships.memberships as membership}
                <Table.Link
                    href={`${base}/project-${project}/auth/teams/team-${membership.teamId}`}>
                    <Table.Cell>
                        <Layout.Stack direction="row" alignItems="center">
                            <AvatarInitials size={32} name={membership.teamName} />
                            <span>{membership.teamName ? membership.teamName : 'n/a'}</span>
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell>
                        {membership.roles}
                    </Table.Cell>
                    <Table.Cell>
                        {toLocaleDateTime(membership.joined)}
                    </Table.Cell>
                    <Table.Cell>
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
                    </Table.Cell>
                </Table.Link>
            {/each}
        </Table.Root>
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
