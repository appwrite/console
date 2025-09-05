<script lang="ts">
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import { AvatarInitials } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import DeleteMembership from '../deleteMembership.svelte';
    import type { Models } from '@appwrite.io/console';
    import { trackEvent, Submit, trackError } from '$lib/actions/analytics';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import {
        Table,
        Layout,
        Empty,
        Card,
        FloatingActionBar,
        Badge,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import Confirm from '$lib/components/confirm.svelte';

    export let data;

    let selectedMembership: Models.Membership;
    let showDelete = false;
    let selectedMemberships: string[] = [];
    let showBulkDelete = false;
    let deleting = false;

    const region = page.params.region;
    const project = page.params.project;

    async function handleBulkDelete() {
        showBulkDelete = false;
        deleting = true;

        // Precompute a lookup map from membershipId to teamId for efficient access
        const membershipIdToTeamId: Record<string, string> = {};
        for (const m of data.memberships.memberships) {
            membershipIdToTeamId[m.$id] = m.teamId;
        }

        const promises = selectedMemberships.map((membershipId) =>
            sdk.forProject(page.params.region, page.params.project).teams.deleteMembership({
                teamId: membershipIdToTeamId[membershipId] || '',
                membershipId
            })
        );

        try {
            await Promise.all(promises);
            trackEvent(Submit.MembershipUpdate, {
                total: selectedMemberships.length
            });
            addNotification({
                type: 'success',
                message: `${selectedMemberships.length} membership${selectedMemberships.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.MEMBERSHIPS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MembershipUpdate);
        } finally {
            selectedMemberships = [];
            showBulkDelete = false;
            deleting = false;
        }
    }
</script>

<Container>
    {#if data.memberships.total}
        <Table.Root
            let:root
            allowSelection
            bind:selectedRows={selectedMemberships}
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
                    href={`${base}/project-${region}-${project}/auth/teams/team-${membership.teamId}`}
                    id={membership.$id}>
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

    {#if selectedMemberships.length > 0}
        <FloatingActionBar>
            <svelte:fragment slot="start">
                <Badge content={selectedMemberships.length.toString()} />
                <span>
                    {selectedMemberships.length > 1 ? 'memberships' : 'membership'}
                    selected
                </span>
            </svelte:fragment>
            <svelte:fragment slot="end">
                <Button text on:click={() => (selectedMemberships = [])}>Cancel</Button>
                <Button secondary on:click={() => (showBulkDelete = true)}>Delete</Button>
            </svelte:fragment>
        </FloatingActionBar>
    {/if}
</Container>

<DeleteMembership {selectedMembership} bind:showDelete />

<Confirm
    title="Delete memberships"
    bind:open={showBulkDelete}
    onSubmit={handleBulkDelete}
    disabled={deleting}>
    <Typography.Text>
        Are you sure you want to delete <b>{selectedMemberships.length}</b>
        {selectedMemberships.length > 1 ? 'memberships' : 'membership'}?
    </Typography.Text>
    <Typography.Text>
        This action is irreversible and will remove the user from the selected teams.
    </Typography.Text>
</Confirm>
