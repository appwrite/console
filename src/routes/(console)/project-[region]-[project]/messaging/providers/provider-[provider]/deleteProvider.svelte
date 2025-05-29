<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { provider } from './store';
    import { project } from '../../../store';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { getProjectRoute } from '$lib/helpers/project';

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
            await goto(getProjectRoute('/messaging/providers'));
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MessagingProviderDelete);
        }
    };
</script>

<Confirm onSubmit={deleteProvider} title="Delete provider" bind:open={showDelete} bind:error>
    <span>Are you sure you want to delete <b>{$provider.name}</b> from '{$project.name}'?</span>
</Confirm>
