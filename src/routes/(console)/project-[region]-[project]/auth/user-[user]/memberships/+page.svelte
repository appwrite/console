<script lang="ts">
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import {
        AvatarInitials,
        type DeleteOperationState,
        MultiSelectionTable
    } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import DeleteMembership from '../deleteMembership.svelte';
    import type { Models } from '@appwrite.io/console';
    import { trackEvent, Submit, trackError } from '$lib/actions/analytics';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { Table, Layout, Empty, Card } from '@appwrite.io/pink-svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();

    let showDelete = $state(false);
    let selectedMembership: Models.Membership | null = $state(null);

    async function handleBulkDelete(selectedRows: string[]): Promise<DeleteOperationState> {
        // Precompute a lookup map from membershipId to teamId for efficient access
        const membershipIdToTeamId: Record<string, string> = {};
        for (const membership of data.memberships.memberships) {
            membershipIdToTeamId[membership.$id] = membership.teamId;
        }

        const promises = selectedRows.map((membershipId) =>
            sdk.forProject(page.params.region, page.params.project).teams.deleteMembership({
                teamId: membershipIdToTeamId[membershipId] || '',
                membershipId
            })
        );

        try {
            await Promise.all(promises);
            trackEvent(Submit.MembershipUpdate, { total: selectedRows.length });
        } catch (error) {
            trackError(error, Submit.MembershipUpdate);
            return error;
        } finally {
            await invalidate(Dependencies.MEMBERSHIPS);
        }
    }
</script>

<Container>
    {#if data.memberships.total}
        <MultiSelectionTable
            resource="membership"
            onDelete={handleBulkDelete}
            columns={[
                { id: 'name' },
                { id: 'roles' },
                { id: 'joined' },
                { id: 'actions', width: 40 }
            ]}>
            {#snippet header(root)}
                <Table.Header.Cell column="name" {root}>Name</Table.Header.Cell>
                <Table.Header.Cell column="roles" {root}>Roles</Table.Header.Cell>
                <Table.Header.Cell column="joined" {root}>Joined</Table.Header.Cell>
                <Table.Header.Cell column="actions" {root} />
            {/snippet}

            {#snippet children(root)}
                {#each data.memberships.memberships as membership}
                    <Table.Row.Link
                        {root}
                        href={`${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${membership.teamId}`}
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
                            <DualTimeView time={membership.joined} />
                        </Table.Cell>
                        <Table.Cell column="actions" {root}>
                            <button
                                class="button is-only-icon is-text"
                                aria-label="Delete item"
                                onclick={(event) => {
                                    event.preventDefault();
                                    selectedMembership = membership;
                                    showDelete = true;
                                    trackEvent('click_delete_membership');
                                }}>
                                <span class="icon-trash" aria-hidden="true"></span>
                            </button>
                        </Table.Cell>
                    </Table.Row.Link>
                {/each}
            {/snippet}

            {#snippet deleteContentNotice()}
                This action is irreversible and will remove the user from the selected teams.
            {/snippet}
        </MultiSelectionTable>
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
