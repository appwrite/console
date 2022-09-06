<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { newOrgModal, organization, organizationList } from '$lib/stores/organization';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    export let showDelete = false;

    const deleteOrg = async () => {
        try {
            await sdkForConsole.teams.delete($organization.$id);
            addNotification({
                type: 'success',
                message: `${$organization.name} has been deleted`
            });
            if ($organizationList?.total > 1) {
                await organizationList.load();
                goto(`${base}/console/organization-${$organizationList.teams[0].$id}`);
            } else {
                newOrgModal.set(true);
                goto(`${base}/console`);
            }
            showDelete = false;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={deleteOrg}>
    <Modal bind:show={showDelete} warning>
        <svelte:fragment slot="header">Delete Organization</svelte:fragment>
        <p>
            Are you sure you want to delete <b>{$organization.name}</b>? All projects ({$organization.total})
            and data associated with this organization will be deleted. This action is irreversible.
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
