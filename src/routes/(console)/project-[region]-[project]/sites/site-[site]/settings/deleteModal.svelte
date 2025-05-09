<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { type Models } from '@appwrite.io/console';

    export let site: Models.Site;
    export let showDelete = false;

    let error: string;
    const handleSubmit = async () => {
        try {
            await sdk.forProject(page.params.region, page.params.project).sites.delete(site.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Site has been deleted`
            });
            await goto(`${base}/project-${page.params.region}-${page.params.project}/sites`);
            trackEvent(Submit.SiteDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.SiteDelete);
        }
    };
</script>

<Confirm onSubmit={handleSubmit} title="Delete site" bind:open={showDelete} bind:error>
    Are you sure you want to delete this site and all associated deployments from your project? This
    action is irreversible.
</Confirm>
