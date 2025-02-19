<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { FormList, InputCheckbox } from '$lib/elements/forms';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { type Models } from '@appwrite.io/console';

    export let site: Models.Site;
    export let showDelete = false;

    let error: string;
    let confirmedDeletion = false;

    const handleSubmit = async () => {
        try {
            await sdk.forProject.sites.delete(site.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Site has been deleted`
            });
            await goto(`${base}/project-${$page.params.project}/sites`);
            trackEvent(Submit.SiteDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.SiteDelete);
        }
    };
</script>

<Confirm
    onSubmit={handleSubmit}
    disabled={!confirmedDeletion}
    title="Delete site"
    bind:open={showDelete}
    bind:error>
    <FormList>
        <p data-private>Are you sure you want to delete <b>{site.name}</b>?</p>

        <p data-private>
            The site and all associated deployments will be permanently deleted. This action is
            irreversible.
        </p>

        <InputCheckbox
            size="s"
            required
            id="delete_site"
            bind:checked={confirmedDeletion}
            label="I understand and confirm" />
    </FormList>
</Confirm>
