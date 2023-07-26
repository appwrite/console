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
            await sdk.forConsole.client.call(
                'PATCH',
                new URL(
                    sdk.forConsole.client.config.endpoint + '/projects/' + $project.$id + '/team'
                ),
                {
                    'X-Appwrite-Project': sdk.forConsole.client.config.project,
                    'content-type': 'application/json'
                },
                {
                    teamId: teamId
                }
            );
            // await sdk.forConsole.projects.update($project.$id, password);
            show = false;
            addNotification({
                type: 'success',
                message: `${$project.name} has been transfered to ${teamName}`
            });
            trackEvent(Submit.ProjectUpdateTeam);
            await goto(`${base}/console/organization-${teamId}`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ProjectUpdateTeam);
        }
    };
</script>

<Modal bind:show onSubmit={handleTransfer} headerDivider={false}>
    <svelte:fragment slot="header">Transfer project</svelte:fragment>
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
