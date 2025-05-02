<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { provider } from './store';
    import { project } from '../../../store';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';

    export let showDelete = false;
    let error: string;
    const deleteProvider = async () => {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .messaging.deleteProvider($provider.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$provider.name} has been deleted`
            });
            trackEvent(Submit.MessagingProviderDelete);
            await goto(
                `${base}/project-${page.params.region}-${page.params.project}/messaging/providers`
            );
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MessagingProviderDelete);
        }
    };
</script>

<Confirm onSubmit={deleteProvider} title="Delete provider" bind:open={showDelete} bind:error>
    Are you sure you want to delete <b>{$provider.name}</b> from '{$project.name}'?
</Confirm>
