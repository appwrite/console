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

    async function deleteAllTargets() {
        try {
            const targets = await sdk
                .forProject(page.params.region, page.params.project)
                .users.listTargets(page.params.user, ['1000']);

            if (targets.targets.length === 0) {
                addNotification({
                    type: 'info',
                    message: 'No targets to delete'
                });
                showDeleteAll = false;
                return;
            }

            const promises = targets.targets.map((target) =>
                sdk
                    .forProject(page.params.region, page.params.project)
                    .users.deleteTarget(page.params.user, target.$id)
            );

            await Promise.all(promises);

            showDeleteAll = false;

            await invalidateAll();

            addNotification({
                type: 'success',
                message: `${targets.targets.length} target${targets.targets.length > 1 ? 's' : ''} for ${$user?.name || 'User'} have been deleted`
            });
            trackEvent(Submit.UserTargetDeleteAll);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.UserTargetDeleteAll);
        }
    }
</script>

<Confirm
    onSubmit={deleteAllTargets}
    title="Delete all targets"
    bind:open={showDeleteAll}
    bind:error>
    Are you sure you want to delete all targets for {$user?.name || 'User'}? This action is
    irreversible.
</Confirm>
