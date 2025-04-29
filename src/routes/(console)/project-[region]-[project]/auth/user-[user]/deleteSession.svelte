<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    export let showDelete = false;
    export let selectedSessionId: string;
    let error: string;

    async function deleteSession() {
        try {
            await sdk.forProject.users.deleteSession(page.params.user, selectedSessionId);
            await invalidate(Dependencies.SESSIONS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: 'Session has been deleted'
            });
            trackEvent(Submit.SessionDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.SessionDelete);
        }
    }
</script>

<Confirm onSubmit={deleteSession} title="Delete session" bind:open={showDelete} bind:error>
    Are you sure you want to delete this session?
</Confirm>
