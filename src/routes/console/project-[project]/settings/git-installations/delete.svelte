<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { project } from '../../store';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let showDelete = false;
    export let selectedInstallation: Models.Installation;

    async function deleteInstallation() {
        try {
            await sdk.forProject.vcs.deleteInstallation(selectedInstallation.$id);
            await invalidate(Dependencies.INSTALLATIONS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${selectedInstallation.$id} has been deleted`
            });
            trackEvent(Submit.InstallationDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.InstallationDelete);
        }
    }
</script>

<Modal
    bind:show={showDelete}
    onSubmit={deleteInstallation}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
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
