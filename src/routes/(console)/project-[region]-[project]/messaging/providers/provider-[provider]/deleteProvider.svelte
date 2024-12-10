<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { provider } from './store';
    import { project } from '../../../store';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let showDelete = false;

    const deleteProvider = async () => {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .messaging.deleteProvider($provider.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$provider.name} has been deleted`
            });
            trackEvent(Submit.MessagingProviderDelete);
            await goto(
                `${base}/project-${$page.params.region}-${$page.params.project}/messaging/providers`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingProviderDelete);
        }
    };
</script>

<Modal
    title="Delete provider"
    bind:show={showDelete}
    onSubmit={deleteProvider}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p data-private>
        Are you sure you want to delete <b>{$provider.name}</b> from '{$project.name}'?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
