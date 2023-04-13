<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { organization, organizationList } from '$lib/stores/organization';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let showDelete = false;

    async function deleteOrg() {
        try {
            await sdk.forConsole.teams.delete($organization.$id);
            await invalidate(Dependencies.ACCOUNT);
            addNotification({
                type: 'success',
                message: `${$organization.name} has been deleted`
            });
            trackEvent(Submit.OrganizationDelete);
            if ($organizationList?.total > 1) {
                goto(`${base}/console/`);
            } else {
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
    }
</script>

<Modal
    onSubmit={deleteOrg}
    bind:show={showDelete}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
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
