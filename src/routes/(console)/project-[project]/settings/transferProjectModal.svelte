<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Confirm } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { project } from '../store';

    export let show = false;
    export let teamName: string;
    export let teamId: string;

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

<Confirm title="Change organization" bind:open={show} onSubmit={handleTransfer}>
    <Typography.Text
        >Are you sure you want to move <b>{$project.name}</b> to
        <b>{teamName}</b>?</Typography.Text>
    <Typography.Text>
        Members who are not part of the destination organization must be invited to gain access to
        this project.
    </Typography.Text>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Move</Button>
    </svelte:fragment>
</Confirm>
