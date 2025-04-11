<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export let showDelete = false;
    export let team: Models.Team<Record<string, unknown>>;

    const deleteTeam = async () => {
        try {
            await sdk.forProject($page.params.region, $page.params.project).teams.delete(team.$id);
            showDelete = false;
            trackEvent(Submit.TeamDelete);
            await goto(`${base}/project-${$page.params.region}-${$page.params.project}/auth/teams`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.TeamDelete);
        }
    };
</script>

<Modal
    title="Delete team"
    bind:show={showDelete}
    onSubmit={deleteTeam}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p data-private>
        Are you sure you want to delete <b>{team.name}</b>?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
