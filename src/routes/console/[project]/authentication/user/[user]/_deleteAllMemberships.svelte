<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { user } from './store';

    export let showDeleteAll = false;

    const deleteAllMemberships = async () => {
        try {
            await sdkForProject.teams.deleteMembership('tmpstring', 'tmpstring2');
            showDeleteAll = false;
            await goto(
                `${base}/console/${$page.params.project}/authentication/${$user.$id}/membeships`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={deleteAllMemberships}>
    <Modal warning={true} bind:show={showDeleteAll}>
        <svelte:fragment slot="header">Delete All Memberships</svelte:fragment>

        <p>
            Are you sure you want to delete <b>{$user.name}'s</b> all memberships?
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDeleteAll = false)}>Cancel</Button>
            <Button secondary submit disabled>To implement Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
