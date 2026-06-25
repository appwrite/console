<script lang="ts">
    import { page } from '$app/state';
    import { invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    let {
        show = $bindable(false),
        addonId
    }: {
        show: boolean;
        addonId: string;
    } = $props();

    let error = $state<string | null>(null);
    let submitting = $state(false);

    async function handleSubmit() {
        submitting = true;
        error = null;
        try {
            await sdk.forConsoleIn(page.params.region).projects.deleteAddon({
                projectId: page.params.project,
                addonId
            });
            await Promise.all([invalidate(Dependencies.ADDONS), invalidate(Dependencies.PROJECT)]);
            addNotification({
                message:
                    'Premium Geo DB addon will be removed at the end of your current billing cycle',
                type: 'success'
            });
            show = false;
        } catch (e) {
            error = e.message;
        } finally {
            submitting = false;
        }
    }
</script>

<Modal bind:error bind:show onSubmit={handleSubmit} title="Disable Premium Geo DB">
    <p class="text">
        Are you sure you want to disable the Premium Geo DB addon? The addon will remain active
        until the end of your current billing cycle and will not be renewed.
    </p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit disabled={submitting}>Disable Premium Geo DB</Button>
    </svelte:fragment>
</Modal>
