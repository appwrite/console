<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    import { createEventDispatcher } from 'svelte';

    export let showActivate = false;
    export let selectedDeployment: Models.Deployment = null;
    export let functionId: string;

    const dispatch = createEventDispatcher();

    const handleSubmit = async () => {
        try {
            await sdkForProject.functions.updateDeployment(functionId, selectedDeployment.$id);
            showActivate = false;
            addNotification({
                type: 'success',
                message: `Deployment has been activated`
            });
            dispatch('activated');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form single on:submit={handleSubmit}>
    <Modal bind:show={showActivate}>
        <svelte:fragment slot="header">Activate Deployment</svelte:fragment>
        <p>Are you sure you want to activate this deployment?</p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showActivate = false)}>Cancel</Button>
            <Button secondary submit>Activate</Button>
        </svelte:fragment>
    </Modal>
</Form>
