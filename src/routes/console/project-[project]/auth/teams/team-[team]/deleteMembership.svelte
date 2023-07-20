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
    import { createEventDispatcher } from 'svelte';
    import LL from '$i18n/i18n-svelte';

    const dispatch = createEventDispatcher();

    export let showDelete = false;
    export let selectedMembership: Models.Membership;

    const deleteMembership = async () => {
        try {
            await sdk.forProject.teams.deleteMembership(
                selectedMembership.teamId,
                selectedMembership.$id
            );
            showDelete = false;
            dispatch('deleted');
            trackEvent(Submit.MemberDelete);
            await goto(
                `${base}/console/project-${$page.params.project}/auth/teams/team-${selectedMembership.teamId}/members`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MemberDelete);
        }
    };
</script>

<Modal
    bind:show={showDelete}
    onSubmit={deleteMembership}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteMember()}</svelte:fragment>
    <p data-private>
        {$LL.console.project.texts.teams.deleteMember()}{' '}<b>{selectedMembership.userName}</b
        >{' '}{$LL.console.project.texts.teams.from()}{' '}'{selectedMembership.teamName}'?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
