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
    import LL from '$i18n/i18n-svelte';
 
    export let showDelete = false;
    export let team: Models.Team<Record<string, unknown>>;

    const deleteTeam = async () => {
        try {
            await sdk.forProject.teams.delete(team.$id);
            showDelete = false;
            trackEvent(Submit.TeamDelete);
            await goto(`${base}/console/project-${$page.params.project}/auth/teams`);
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
    bind:show={showDelete}
    onSubmit={deleteTeam}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteTeam()}</svelte:fragment>
    <p data-private>
        {$LL.console.project.texts.teams.deleteTeam()}{' '}<b>{team.name}</b>?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
