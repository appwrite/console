<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import type { Models } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    export let show = false;
    export let site: Models.Site;
    let error = '';

    const dispatch = createEventDispatcher();

    const handleSubmit = async () => {
        try {
            await invalidate(Dependencies.FUNCTION);
            dispatch('success');
            addNotification({
                type: 'success',
                message: `Repository has been disconnected from your function`
            });
            trackEvent(Submit.FunctionDisconnectRepo);
            show = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.FunctionDisconnectRepo);
        }
    };

    $: if (!show) {
        error = '';
    }
</script>

<Modal title="Disconnect Git repository" bind:show bind:error onSubmit={handleSubmit}>
    <p data-private>
        Are you sure you want to disconnect <b>{site.name}</b>? This will affect future deployments
        to this site.
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Disconnect</Button>
    </svelte:fragment>
</Modal>
