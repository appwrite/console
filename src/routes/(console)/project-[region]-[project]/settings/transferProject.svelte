<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../store';

    export let show = false;
    export let teamName;
    export let teamId;

    const handleTransfer = async () => {
        try {
            await sdk.forConsole.projects.updateTeam($project.$id, teamId);
            show = false;
            addNotification({
                type: 'success',
                message: `${$project.name} has been transferred to ${teamName}`
            });
            trackEvent(Submit.ProjectUpdateTeam);
            await goto(`${base}/organization-${teamId}`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ProjectUpdateTeam);
        }
    };
</script>

<Modal title="Transfer project" bind:show onSubmit={handleTransfer} headerDivider={false}>
    <p>Are you sure you want to transfer <b>{$project.name}</b> to <b>{teamName}</b>?</p>
    <p>
        Members who are not part of the destination organization must be invited to gain access to
        this project.
    </p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Transfer</Button>
    </svelte:fragment>
</Modal>
