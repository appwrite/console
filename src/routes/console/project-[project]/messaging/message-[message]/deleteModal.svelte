<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { message } from './store';

    export let show = false;

    const deleteMessage = async () => {
        try {
            await sdk.forProject.client.call(
                'DELETE',
                new URL(
                    `${sdk.forProject.client.config.endpoint}/messaging/messages/${$message.$id}`
                ),
                {
                    'X-Appwrite-Project': sdk.forProject.client.config.project,
                    'content-type': 'application/json',
                    'X-Appwrite-Mode': 'admin'
                }
            );
            show = false;
            addNotification({
                type: 'success',
                message: `Message has been deleted`
            });
            trackEvent(Submit.MessagingMessageDelete);
            await goto(`${base}/console/project-${$page.params.project}/messaging`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingMessageDelete);
        }
    };
</script>

<Modal
    title="Delete message"
    bind:show
    onSubmit={deleteMessage}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p data-private>Are you sure you want to delete this message?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
