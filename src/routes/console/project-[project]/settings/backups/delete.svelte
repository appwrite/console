<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { project } from '../../store';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@aw-labs/appwrite-console';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { base } from '$app/paths';

    export let showDelete = false;
    export let selectedBackup: Models.Backup;

    const deleteBackup = async () => {
        try {
            await sdkForConsole.projects.deleteBackup($project.$id, selectedBackup.$id);
            addNotification({
                type: 'success',
                message: `${selectedBackup.name} has been deleted`
            });
            trackEvent(Submit.BackupDelete);
            await invalidate(Dependencies.BACKUPS);
            await goto(`${base}/console/project-${$project.$id}/settings/backups`);
            showDelete = false;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.BackupDelete);
        }
    };
</script>

<Modal bind:show={showDelete} on:submit={deleteBackup} warning>
    <svelte:fragment slot="header">Delete Backup</svelte:fragment>
    {#if selectedBackup}
        <p data-private>
            Are you sure you want to delete backup <b>{selectedBackup.name}</b> from '{$project.name}'?
        </p>
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
