<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';

    export let show = false;
    export let addonId: string;

    let error: string = null;
    let submitting = false;

    async function handleSubmit() {
        submitting = true;
        error = null;
        try {
            await sdk.forConsole.organizations.deleteToggleAddon({
                organizationId: $organization.$id,
                addonId
            });
            await Promise.all([
                invalidate(Dependencies.ADDONS),
                invalidate(Dependencies.ORGANIZATION)
            ]);
            addNotification({
                message: 'BAA addon will be removed at the end of your current billing cycle',
                type: 'success'
            });
            trackEvent(Submit.BAAAddonDisable);
            show = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.BAAAddonDisable);
        } finally {
            submitting = false;
        }
    }
</script>

<Modal bind:error bind:show onSubmit={handleSubmit} title="Disable BAA">
    <p class="text">
        Are you sure you want to disable the BAA addon? The addon will remain active until the end
        of your current billing cycle and will not be renewed.
    </p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit disabled={submitting}>Disable BAA</Button>
    </svelte:fragment>
</Modal>
