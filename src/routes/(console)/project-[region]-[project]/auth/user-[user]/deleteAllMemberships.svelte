<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { user } from './store';

    export let showDeleteAll = false;

    let error: string;

    async function deleteAllMemberships() {
        try {
            const memberships = await sdk
                .forProject(page.params.region, page.params.project)
                .users.listMemberships(page.params.user);

            if (memberships.memberships.length === 0) {
                addNotification({
                    type: 'info',
                    message: 'No memberships to delete'
                });
                showDeleteAll = false;
                return;
            }

            const promises = memberships.memberships.map((membership) =>
                sdk
                    .forProject(page.params.region, page.params.project)
                    .teams.deleteMembership(membership.teamId, membership.$id)
            );

            await Promise.all(promises);
            showDeleteAll = false;
            await invalidateAll();

            addNotification({
                type: 'success',
                message: `${memberships.memberships.length} membership${memberships.memberships.length > 1 ? 's' : ''} for ${$user?.name || 'User'} have been deleted`
            });
            trackEvent(Submit.MembershipDeleteAll);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MembershipDeleteAll);
        }
    }
</script>

<Confirm
    onSubmit={deleteAllMemberships}
    title="Delete all memberships"
    bind:open={showDeleteAll}
    bind:error>
    Are you sure you want to delete all memberships for {$user?.name || 'User'}? This action is
    irreversible.
</Confirm>
