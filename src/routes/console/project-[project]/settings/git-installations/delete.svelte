<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { project } from '../../store';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';

    export let showDelete = false;
    export let selectedInstallation: Models.Installation;

    async function deleteInstallation() {
        try {
            await sdkForProject.vcs.deleteInstallation(selectedInstallation.$id);
            await invalidate(Dependencies.INSTALLATIONS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${selectedInstallation.$id} has been deleted`
            });
            trackEvent('submit_installation_delete');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Modal bind:show={showDelete} on:submit={deleteInstallation} warning={true}>
    <svelte:fragment slot="header">Delete Installation</svelte:fragment>
    {#if selectedInstallation}
        <p data-private>
            Are you sure you want to delete <b>{selectedInstallation.$id}</b> from '{$project.name}'?
        </p>
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
