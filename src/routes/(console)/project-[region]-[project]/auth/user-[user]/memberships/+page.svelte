<script lang="ts">
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import { AvatarInitials } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import DeleteMembership from '../deleteMembership.svelte';
    import type { Models } from '@appwrite.io/console';
    import { trackEvent } from '$lib/actions/analytics';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Table, Layout, Empty, Card } from '@appwrite.io/pink-svelte';

    export let data;

    let selectedMembership: Models.Membership;
    let showDelete = false;

    const project = page.params.project;
</script>

<Container>
    {#if data.memberships.total}
        <Table.Root
            let:root
            columns={[
                { id: 'name' },
                { id: 'roles' },
                { id: 'joined' },
                { id: 'actions', width: 40 }
            ]}>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="name" {root}>Name</Table.Header.Cell>
                <Table.Header.Cell column="roles" {root}>Roles</Table.Header.Cell>
                <Table.Header.Cell column="joined" {root}>Joined</Table.Header.Cell>
                <Table.Header.Cell column="actions" {root} />
            </svelte:fragment>
            {#each data.memberships.memberships as membership}
                <Table.Row.Link
                    {root}
                    href={`${base}/project-${project}/auth/teams/team-${membership.teamId}`}>
                    <Table.Cell column="name" {root}>
                        <Layout.Stack direction="row" alignItems="center">
                            <AvatarInitials size="xs" name={membership.teamName} />
                            <span>{membership.teamName ? membership.teamName : 'n/a'}</span>
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell column="roles" {root}>
                        {membership.roles}
                    </Table.Cell>
                    <Table.Cell column="joined" {root}>
                        {toLocaleDateTime(membership.joined)}
                    </Table.Cell>
                    <Table.Cell column="actions" {root}>
                        <button
                            class="button is-only-icon is-text"
                            aria-label="Delete item"
                            on:click|preventDefault={() => {
                                selectedMembership = membership;
                                showDelete = true;
                                trackEvent('click_delete_membership');
                            }}>
                            <span class="icon-trash" aria-hidden="true"></span>
                        </button>
                    </Table.Cell>
                </Table.Row.Link>
            {/each}
        </Table.Root>
    {:else}
        <Card.Base padding="none">
            <Empty
                title="No memberships available"
                description="Need a hand? Learn more in our documentation."
                type="secondary">
                <svelte:fragment slot="actions">
                    <Button
                        external
                        secondary
                        href="https://appwrite.io/docs/products/auth/teams#create-membership">
                        Documentation
                    </Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>

<DeleteMembership {selectedMembership} bind:showDelete />
