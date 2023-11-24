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
    import { projects } from '../store';
    import { toLocaleDate } from '$lib/helpers/date';

    export let showDelete = false;
    let error: string = null;

    //TODO: replace variable with value from method
    const TEMPORARY_SET_FOR_DELETION = true;

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
        } catch (e) {
            error = e.message;
            trackError(e, Submit.OrganizationDelete);
        }
    }
</script>

<Modal
    title="Delete organization"
    onSubmit={deleteOrg}
    bind:show={showDelete}
    bind:error
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    {#if TEMPORARY_SET_FOR_DELETION}
        <p data-private>
            The organization <b>{$organization.name}</b> will be flagged for deletion.
        </p>

        <p data-private>
            All existing projects will be paused and the organization will be deleted once your
            upcoming invoice is processed on {toLocaleDate($organization.billingNextInvoiceDate)}.
        </p>
    {:else}
        <p data-private>
            Are you sure you want to delete <b>{$organization.name}</b>? All projects ({$projects.total})
            and data associated with this organization will be deleted. This action is irreversible.
        </p>
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
