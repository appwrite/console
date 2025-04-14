<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import type { Models } from '@appwrite.io/console';

    export let show = false;
    export let message: Models.Message & { data: Record<string, unknown> };

    let description = message.data.title ?? message.data.subject ?? message.data.content ?? '';

    const deleteMessage = async () => {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .messaging.delete(message.$id);
            show = false;
            let notificationMessage = '';
            switch (message.status) {
                case 'draft':
                    notificationMessage = `The ${message.status} message has been deleted`;
                    break;
                case 'scheduled':
                    notificationMessage =
                        'The scheduled message has been deleted, and its delivery was cancelled';
                    break;
                default:
                    notificationMessage = 'The message has been deleted';
                    break;
            }
            addNotification({
                type: 'success',
                message: notificationMessage
            });
            trackEvent(Submit.MessagingMessageDelete);
            await goto(`${base}/project-${$page.params.region}-${$page.params.project}/messaging`);
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
    <p data-private>
        Are you sure you want to delete
        {#if description}
            <span class="u-bold">{description}</span>{:else}
            this message
        {/if}?
    </p>

    <p class="u-bold">
        {#if message.status === 'draft'}
            This action is irreversible.
        {:else if message.status === 'scheduled'}
            This is a scheduled message. Deleting it will result in the cancellation of its
            delivery. This action is irreversible.
        {:else if message.status === 'sent'}
            The message has already been sent. After deleting it, you will no longer see it here.
        {:else if message.status === 'failed'}
            The message has been sent with errors. After deleting it, you will no longer see it
            here.
        {/if}
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
