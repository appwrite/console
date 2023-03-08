<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk, sdkForConsole } from '$lib/stores/sdk';
    import { organization, organizationList } from '$lib/stores/organization';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let showDelete = false;

    const deleteOrg = async () => {
        try {
            await sdkForConsole.teams.delete($organization.$id);
            addNotification({
                type: 'success',
                message: `${$organization.name} has been deleted`
            });
            trackEvent(Submit.OrganizationDelete);
            if ($organizationList?.total > 1) {
                await invalidate(Dependencies.ACCOUNT);
                goto(`${base}/console/`);
            } else {
                await invalidate(Dependencies.ACCOUNT);
                goto(`${base}/console/onboarding`);
            }
            showDelete = false;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.OrganizationDelete);
        }
    };
</script>

<Modal on:submit={deleteOrg} bind:show={showDelete} warning>
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
