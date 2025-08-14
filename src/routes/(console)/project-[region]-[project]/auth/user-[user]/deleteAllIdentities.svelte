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

    async function deleteAllIdentities() {
        try {
            const identities = await sdk
                .forProject(page.params.region, page.params.project)
                .users.listIdentities([], '1000');

            if (identities.identities.length === 0) {
                addNotification({
                    type: 'info',
                    message: 'No identities to delete'
                });
                showDeleteAll = false;
                return;
            }

            const promises = identities.identities.map((identity) =>
                sdk
                    .forProject(page.params.region, page.params.project)
                    .users.deleteIdentity(identity.$id)
            );

            await Promise.all(promises);
            showDeleteAll = false;
            await invalidateAll();

            addNotification({
                type: 'success',
                message: `${identities.identities.length} identit${identities.identities.length > 1 ? 'ies' : 'y'} for ${$user?.name || 'User'} have been deleted`
            });
            trackEvent(Submit.UserIdentityDeleteAll);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.UserIdentityDeleteAll);
        }
    }
</script>

<Confirm
    onSubmit={deleteAllIdentities}
    title="Delete all identities"
    bind:open={showDeleteAll}
    bind:error>
    Are you sure you want to delete all identities for {$user?.name || 'User'}? This action is
    irreversible.
</Confirm>
