<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    import { createEventDispatcher } from 'svelte';
    import { user } from '$lib/stores/user';

    const dispatch = createEventDispatcher();

    export let showDelete = false;
    export let selectedMember: Models.Membership;

    const deleteMembership = async () => {
        try {
            await sdkForConsole.teams.deleteMembership(selectedMember.teamId, selectedMember.$id);
            showDelete = false;
            dispatch('deleted');
            addNotification({
                type: 'success',
                message: `${selectedMember.userName} was deleted from ${selectedMember.teamName}`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    $: isUser = selectedMember.userId === $user.$id;
</script>

<Form on:submit={deleteMembership}>
    <Modal bind:show={showDelete} warning>
        <svelte:fragment slot="header">
            {isUser ? 'Leave Organization' : 'Delete Member'}
        </svelte:fragment>
        <p>
            {isUser
                ? `Are you sure you want to leave '${selectedMember.teamName}'?`
                : `Are you sure you want to delete ${selectedMember.userName} from '${selectedMember.teamName}'?`}
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>{isUser ? 'Leave' : 'Delete'}</Button>
        </svelte:fragment>
    </Modal>
</Form>
