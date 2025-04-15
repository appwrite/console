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

    export let showDelete = false;
    export let selectedMembership: Models.Membership;

    async function deleteMembership() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .teams.deleteMembership(selectedMembership.teamId, selectedMembership.$id);
            await invalidate(Dependencies.MEMBERSHIPS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Membership has been deleted`
            });
            trackEvent(Submit.MemberDelete);
            await goto(
                `${base}/project-${$page.params.region}-${$page.params.project}/auth/user-${selectedMembership.userId}/memberships`
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
    title="Delete member"
    bind:show={showDelete}
    onSubmit={deleteMembership}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    {#if selectedMembership}
        <p data-private>
            Are you sure you want to delete <b>{selectedMembership.userName}</b> from '{selectedMembership.teamName}'?
        </p>
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
