<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { user } from './store';

    export let showDeleteAll = false;

    let error: string;

    async function deleteAllSessions() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .users.deleteSessions(page.params.user);
            await invalidate(Dependencies.SESSIONS);
            showDeleteAll = false;
            addNotification({
                type: 'success',
                message: 'All sessions have been deleted'
            });
            trackEvent(Submit.SessionDeleteAll);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.SessionDeleteAll);
        }
    }
</script>

<Confirm onSubmit={deleteAllSessions} title="Delete member" bind:open={showDeleteAll} bind:error>
    Are you sure you want to delete <b>all of {$user?.name || 'User'}'s sessions?</b>
</Confirm>
