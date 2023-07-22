<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import LL from '$i18n/i18n-svelte';
    
    export let showDelete = false;
    export let selectedMembership: Models.Membership;

    async function deleteMembership() {
        try {
            await sdk.forProject.teams.deleteMembership(
                selectedMembership.teamId,
                selectedMembership.$id
            );
            await invalidate(Dependencies.MEMBERSHIPS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Membership has been deleted`
            });
            trackEvent(Submit.MemberDelete);
            await goto(
                `${base}/console/project-${$page.params.project}/auth/user-${selectedMembership.userId}/memberships`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MemberDelete);
        }
    }
</script>

<Modal
    bind:show={showDelete}
    onSubmit={deleteMembership}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteMember()}</svelte:fragment>
    {#if selectedMembership}
        <p data-private>
            {$LL.console.project.texts.users.deleteMembership.phaseOne()}{' '}<b
                >{selectedMembership.userName}</b
            >{' '}{$LL.console.project.texts.users.deleteMembership.phaseTwo()}{' '}'{selectedMembership.teamName}'?
        </p>
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
